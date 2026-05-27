// src/jobs/notificationWorker.js
const cron = require('node-cron');
const { Op } = require('sequelize');
const pushService = require('../services/push.service');
// Importa tus modelos de Sequelize
const {
    patient_notification_rules: PatientRule,
    notification_templates: Template,
    patient_notifications_history: NotificationHistory,
    patients: Patient // Supongamos que aquí guardas el fcm_token
} = require('../models/mysql');

// Tarea programada: Ejecutar CADA MINUTO
cron.schedule('* * * * *', async () => {
    console.log('--- Iniciando verificación de notificaciones push programadas ---');

    try {
        const ahora = new Date();

        // 1. Buscar reglas que ya deban ejecutarse (next_run_at <= ahora) y estén activas
        const rulesToProcess = await PatientRule.findAll({
            where: {
                is_active: true,
                next_run_at: {
                    [Op.lte]: ahora
                }
            },
            include: [
                { model: Template, as: 'template' },
                { model: Patient, as: 'patient', attributes: ['id', 'fcm_token', 'first_name'] } // Traer el token del paciente
            ]
        });

        if (rulesToProcess.length === 0) {
            console.log('No hay notificaciones pendientes por enviar en este minuto.');
            return;
        }

        for (const rule of rulesToProcess) {
            let finalTitle = '';
            let finalMessage = '';

            // 2. Jerarquía de Mensajes: ¿Tiene texto personalizado o usa la plantilla base?
            if (rule.custom_title && rule.custom_message) {
                finalTitle = rule.custom_title;
                finalMessage = rule.custom_message;
            } else if (rule.template) {
                finalTitle = rule.template.title_template;
                finalMessage = rule.template.message_template;
            } else {
                console.warn(`La regla ${rule.id} no tiene mensaje asignado ni plantilla.`);
                continue;
            }

            // 3. Procesar / Reemplazar Placeholders con el context_data o info del paciente
            const context = rule.context_data || {};
            context.patient_name = rule.patient?.first_name || 'Paciente'; // Inyección automática por defecto

            finalTitle = replacePlaceholders(finalTitle, context);
            finalMessage = replacePlaceholders(finalMessage, context);

            // 4. Verificar si el paciente tiene el Token de la App Móvil guardado
            const deviceToken = rule.patient?.fcm_token;

            if (!deviceToken) {
                // Si no hay token, registramos el fallo en el historial y desactivamos la regla
                await NotificationHistory.create({
                    tenant_id: rule.tenant_id,
                    patient_id: rule.patient_id,
                    template_id: rule.template_id,
                    final_title: finalTitle,
                    final_message: finalMessage,
                    status: 'failed',
                    failure_reason: 'El paciente no tiene un token de dispositivo móvil registrado.'
                });

                await rule.update({ is_active: false });
                continue;
            }

            // 5. Enviar vía Firebase Push Service
            // Puedes pasar el rule.id o metadata en el payload para telemetría en el móvil
            const payloadData = { rule_id: rule.id.toString(), tenant_id: rule.tenant_id.toString() };
            const pushResult = await pushService.sendPushNotification(deviceToken, finalTitle, finalMessage, payloadData);

            // 6. Guardar en el historial de envíos
            await NotificationHistory.create({
                tenant_id: rule.tenant_id,
                patient_id: rule.patient_id,
                template_id: rule.template_id,
                final_title: finalTitle,
                final_message: finalMessage,
                status: pushResult.success ? 'sent' : 'failed',
                failure_reason: pushResult.success ? null : pushResult.error
            });

            // 7. Calcular la siguiente ejecución (Recurrencia)
            await updateNextRunDate(rule);
        }

    } catch (error) {
        console.error('Error crítico en el Worker de notificaciones:', error);
    }
});

// Función auxiliar para renderizar los placeholders dinámicos
function replacePlaceholders(text, data) {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
    });
}

// Función para calcular cuándo se vuelve a disparar según el repeat_type
async function updateNextRunDate(rule) {
    if (rule.repeat_type === 'once') {
        // Si era de una sola vez, la desactivamos para que no se vuelva a enviar
        await rule.update({ is_active: false, next_run_at: null });
    } else {
        let nextRun = new Date(rule.next_run_at);

        if (rule.repeat_type === 'daily') {
            nextRun.setDate(nextRun.getDate() + 1);
        } else if (rule.repeat_type === 'weekly') {
            nextRun.setDate(nextRun.getDate() + 7);
        } else if (rule.repeat_type === 'monthly') {
            nextRun.setMonth(nextRun.getMonth() + 1);
        }

        // Verificar si ya superó la fecha límite (end_date) si es que existe
        if (rule.end_date && nextRun > new Date(rule.end_date + 'T' + rule.start_time)) {
            await rule.update({ is_active: false, next_run_at: null });
        } else {
            await rule.update({ next_run_at: nextRun });
        }
    }
}
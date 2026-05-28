// src/jobs/notificationWorker.js
const cron = require('node-cron');
const { Op } = require('sequelize');
const { DateTime } = require('luxon');
const pushService = require('../services/push.service');
// Importa tus modelos de Sequelize
const PatientRule = require('../models/mysql/patient_notification_rule.model');
const Template = require('../models/mysql/notification_template.model');
const NotificationHistory = require('../models/mysql/patient_notifications_history.model');
const Patient = require('../models/mysql/patient.model');
const PatientMovil = require('../models/mysql/patient_movil.model');
const Tenant = require('../models/mysql/tenant.model');

// Tarea programada: Ejecutar CADA MINUTO
cron.schedule('* * * * *', async () => {
    console.log('--- Iniciando verificación de notificaciones push programadas ---');

    try {
        // 1. Buscamos todas las reglas activas (sin filtrar por hora aún en la query, o trayendo el Tenant obligado)
        const rulesToProcess = await PatientRule.findAll({
            where: { is_active: true },
            include: [
                { model: Template, as: 'template' },
                { model: Tenant, as: 'tenant' }, // Incluir el Tenant con su timezone
                {
                    model: Patient,
                    as: 'patient',
                    attributes: ['id', 'first_name'],
                    include: [
                        { model: PatientMovil, as: 'movil_tokens', attributes: ['token'] }
                    ]
                } // Traer el token del paciente
            ]
        });

        if (rulesToProcess.length === 0) {
            console.log('No hay notificaciones pendientes por enviar en este minuto.');
            return;
        }

        for (const rule of rulesToProcess) {
            const tenantTimezone = rule.tenant?.timezone || 'UTC';
            const ahoraEnTenant = DateTime.now().setZone(tenantTimezone).toJSDate();
            const nextRunAt = new Date(rule.next_run_at);

            // Verificar si corresponde ejecutar en la hora de SU zona horaria
            if (nextRunAt > ahoraEnTenant) {
                continue; // Aún no es hora para este Tenant particular
            }

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
            const deviceToken = rule.patient?.movil_tokens && rule.patient.movil_tokens.length > 0 ? rule.patient.movil_tokens[0].token : null;

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
            await updateNextRunDate(rule, tenantTimezone);
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
async function updateNextRunDate(rule, timezone) {
    if (rule.repeat_type === 'once') {
        await rule.update({ is_active: false, next_run_at: null });
    } else {
        // Usamos Luxon para añadir días/meses respetando cambios de horario de verano locales (DST)
        let nextRunDT = DateTime.fromJSDate(new Date(rule.next_run_at)).setZone(timezone);
        if (rule.repeat_type === 'daily') nextRunDT = nextRunDT.plus({ days: 1 });
        else if (rule.repeat_type === 'weekly') nextRunDT = nextRunDT.plus({ weeks: 1 });
        else if (rule.repeat_type === 'monthly') nextRunDT = nextRunDT.plus({ months: 1 });
        const nextRunJS = nextRunDT.toJSDate();
        if (rule.end_date && nextRunJS > new Date(rule.end_date + 'T' + rule.start_time)) {
            await rule.update({ is_active: false, next_run_at: null });
        } else {
            await rule.update({ next_run_at: nextRunJS });
        }
    }
}
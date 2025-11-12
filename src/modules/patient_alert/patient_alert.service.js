const sequelize = require('../../config/database');
const patientAlertRepository = require('./patient_alert.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class PatientAlertService {
    // 🟢 Crear nueva alerta
    async createPatientAlert(data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const allowedFields = ['tenant_id', 'patient_id', 'title', 'description', 'is_admin_alert'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            cleanData.tenant_id = currentUser.tenant_id;

            const newAlert = await patientAlertRepository.createAlert(cleanData, t);
            await t.commit();

            // 🪵 Log de auditoría
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'patient_alerts',
                description: `Alerta creada para paciente #${newAlert.patient_id}: ${newAlert.title}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación si es alerta administrativa
            if (newAlert.is_admin_alert) {
                await notifyUser({
                    user_id: currentUser.id,
                    title: 'Nueva alerta administrativa',
                    message: `${currentUser.username} creó una alerta administrativa: ${newAlert.title}`,
                    type: 'warning'
                });
            }

            return newAlert;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear alerta: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar alerta existente
    async updatePatientAlert(id, data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const alert = await patientAlertRepository.findById(id, currentUser.tenant_id);
            if (!alert) throw new Error('Alerta no encontrada');

            const allowedFields = ['title', 'description', 'is_admin_alert'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            await patientAlertRepository.updateAlert(alert, cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'patient_alerts',
                description: `Alerta actualizada: ${alert.title}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return alert;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar alerta: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar alerta (borrado físico, con log)
    async deletePatientAlert(id, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const t = await sequelize.transaction();
        try {
            const alert = await patientAlertRepository.findById(id, currentUser.tenant_id);
            if (!alert) throw new Error('Alerta no encontrada');

            await patientAlertRepository.deleteAlert(alert, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'patient_alerts',
                description: `Alerta eliminada: ${alert.title}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar alerta: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 📋 Obtener todas las alertas de un paciente
    async getAlertsByPatientId(patientId, currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        return await patientAlertRepository.findByPatientId(patientId, currentUser.tenant_id);
    }
}

module.exports = new PatientAlertService();

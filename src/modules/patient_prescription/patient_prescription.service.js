const sequelize = require('../../config/database');
const patientPrescriptionRepository = require('./patient_prescription.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class PatientPrescriptionService {
    // 🟢 Crear nueva prescripción
    async createPatientPrescription(data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const allowedFields = ['tenant_id', 'patient_id', 'title', 'content'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            cleanData.tenant_id = currentUser.tenant_id;

            const newPrescription = await patientPrescriptionRepository.create(cleanData, t);
            await t.commit();

            // 🪵 Log de auditoría
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'patient_prescriptions',
                description: `Prescripción creada para paciente #${newPrescription.patient_id}: ${newPrescription.title}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación informativa
            await notifyUser({
                user_id: currentUser.id,
                title: 'Nueva prescripción agregada',
                message: `${currentUser.username} registró la prescripción "${newPrescription.title}" para un paciente.`,
                type: 'info'
            });

            return newPrescription;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear prescripción: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar prescripción existente
    async updatePatientPrescription(id, data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const prescription = await patientPrescriptionRepository.findById(id, currentUser.tenant_id);
            if (!prescription) throw new Error('Prescripción no encontrada');

            const allowedFields = ['title', 'content'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            await patientPrescriptionRepository.update(prescription, cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'patient_prescriptions',
                description: `Prescripción actualizada: ${prescription.title}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return prescription;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar prescripción: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar prescripción (borrado físico, con log)
    async deletePatientPrescription(id, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const t = await sequelize.transaction();
        try {
            const prescription = await patientPrescriptionRepository.findById(id, currentUser.tenant_id);
            if (!prescription) throw new Error('Prescripción no encontrada');

            await patientPrescriptionRepository.delete(prescription, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'patient_prescriptions',
                description: `Prescripción eliminada: ${prescription.title}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar prescripción: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 📋 Obtener todas las prescripciones de un paciente
    async getByPatientId(patientId, currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        return await patientPrescriptionRepository.findByPatientId(patientId, currentUser.tenant_id);
    }
}

module.exports = new PatientPrescriptionService();

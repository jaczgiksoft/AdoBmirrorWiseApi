const sequelize = require('../../config/database');
const repo = require('./patient_representative_link.repository');
const repRepo = require('../patient_representative/patient_representative.repository');
const patientRepo = require('../patient/patient.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { notifyUser } = require('../../utils/notify.helper');
const { logger } = require('../../utils/logger');

class PatientRepresentativeLinkService {

    async listForPatient(patientId, currentUser) {
        return await repo.findAllByPatient(patientId, currentUser.tenant_id);
    }

    async add(data, currentUser, req) {
        const t = await sequelize.transaction();

        try {
            const { patient_id, representative_id } = data;

            // Validar paciente
            const patient = await patientRepo.findById(patient_id, currentUser.tenant_id);
            if (!patient) throw new Error('Paciente no encontrado');

            // Validar representante
            const representative = await repRepo.findById(representative_id, currentUser.tenant_id);
            if (!representative) throw new Error('Representante no encontrado');

            // Validar duplicado
            const existing = await repo.findLink(patient_id, representative_id, currentUser.tenant_id);
            if (existing) throw new Error('El representante ya está asignado al paciente.');

            // Crear relación
            const link = await repo.createLink({
                tenant_id: currentUser.tenant_id,
                patient_id,
                representative_id,
                is_primary: false
            }, t);

            await t.commit();

            // Logs y notificaciones
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'patient_representative_link',
                description: `Asignó representante ${representative.full_name} al paciente ${patient.first_name} ${patient.last_name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            await notifyUser({
                user_id: currentUser.id,
                title: 'Nuevo representante asignado',
                message: `Se asignó un representante al paciente ${patient.first_name} ${patient.last_name}.`,
                type: 'info'
            });

            return link;

        } catch (err) {
            await t.rollback();
            logger.error(`Error al asignar representante: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async remove(id, currentUser, req) {
        const t = await sequelize.transaction();

        try {
            const link = await repo.findById(id, currentUser.tenant_id);
            if (!link) throw new Error('Relación no encontrada');

            await repo.deleteLink(link, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'patient_representative_link',
                description: `Se eliminó el representante #${link.representative_id} del paciente #${link.patient_id}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;

        } catch (err) {
            await t.rollback();
            await logApiError(req, err);
            throw err;
        }
    }

    async setPrimary(id, currentUser, req) {
        const t = await sequelize.transaction();

        try {
            const link = await repo.findById(id, currentUser.tenant_id);
            if (!link) throw new Error('Relación no encontrada');

            // Limpiar primarios anteriores
            await repo.unsetAllPrimary(link.patient_id, currentUser.tenant_id, t);

            // Marcar este como primario
            await link.update({ is_primary: true }, { transaction: t });

            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'patient_representative_link',
                description: `Marcó como principal el representante ${link.representative_id} para el paciente ${link.patient_id}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return link;

        } catch (err) {
            await t.rollback();
            await logApiError(req, err);
            throw err;
        }
    }
}

module.exports = new PatientRepresentativeLinkService();

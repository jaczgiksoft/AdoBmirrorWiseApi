const sequelize = require('../../config/database');
const billingRepository = require('./patient_billing_data.repository');
const billingDataRepo = require('../billing_data/billing_data.repository');
const patientRepo = require('../patient/patient.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { notifyUser } = require('../../utils/notify.helper');
const { logger } = require('../../utils/logger');

class PatientBillingDataService {

    async getBillingForPatient(patientId, currentUser) {
        return await billingRepository.findAllByPatient(patientId, currentUser.tenant_id);
    }

    async addBillingToPatient(data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado');

        const t = await sequelize.transaction();
        try {
            const { patient_id, billing_data_id } = data;

            // Validar existencia de paciente y billing
            const patient = await patientRepo.findById(patient_id, currentUser.tenant_id);
            if (!patient) throw new Error('Paciente no encontrado');

            const billingData = await billingDataRepo.findById(billing_data_id, currentUser.tenant_id);
            if (!billingData) throw new Error('Datos fiscales no encontrados');

            // Verificar si ya existe la relación
            const existing = await billingRepository.findLink(patient_id, billing_data_id, currentUser.tenant_id);
            if (existing) throw new Error('Esta relación ya existe');

            const newLink = await billingRepository.createLink({
                tenant_id: currentUser.tenant_id,
                patient_id,
                billing_data_id,
                is_primary: false
            }, t);

            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'patient_billing_data',
                description: `Asignó BillingData #${billing_data_id} al paciente #${patient_id}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            await notifyUser({
                user_id: currentUser.id,
                title: 'Datos fiscales asignados',
                message: `Se asignaron datos fiscales al paciente ${patient.first_name} ${patient.last_name}.`,
                type: 'info'
            });

            return newLink;

        } catch (err) {
            await t.rollback();
            logger.error(`Error al asignar datos fiscales: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async removeBillingFromPatient(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const link = await billingRepository.findById(id, currentUser.tenant_id);
            if (!link) throw new Error('Relación no encontrada');

            await billingRepository.deleteLink(link, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'patient_billing_data',
                description: `Eliminó relación BillingData del paciente`,
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
            const link = await billingRepository.findById(id, currentUser.tenant_id);
            if (!link) throw new Error('Relación no encontrada');

            // Limpiar anteriores primarios
            await billingRepository.setPrimaryForPatient(link.patient_id, currentUser.tenant_id, t);

            // Marcar este como primario
            await link.update({ is_primary: true }, { transaction: t });

            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'patient_billing_data',
                description: `Marcó como primario el BillingData en paciente ${link.patient_id}`,
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

module.exports = new PatientBillingDataService();

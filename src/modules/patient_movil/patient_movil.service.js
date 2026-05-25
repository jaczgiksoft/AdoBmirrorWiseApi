const sequelize = require('../../config/database');
const patientMovilRepository = require('./patient_movil.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

class PatientMovilService {
    // 🟢 Registrar o actualizar token
    async registerToken(data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const { token } = data;
            const patient_id = data.patient_id || currentUser.id;

            const existing = await patientMovilRepository.findByToken(currentUser.tenant_id, patient_id, token);

            if (existing) {
                existing.changed('updated_at', true);
                await existing.save({ transaction: t });
                await t.commit();
                return existing;
            }

            const newRecord = await patientMovilRepository.createToken({
                tenant_id: currentUser.tenant_id,
                patient_id,
                token
            }, t);
            
            await t.commit();

            // 🪵 Log de auditoría
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'patient_movil',
                description: `Token registrado para paciente #${patient_id}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return newRecord;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al registrar token: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Remover token
    async removeToken(data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const t = await sequelize.transaction();
        try {
            const { token } = data;
            const patient_id = data.patient_id || currentUser.id;

            const existing = await patientMovilRepository.findByToken(currentUser.tenant_id, patient_id, token);
            if (!existing) throw new Error('Token no encontrado');

            await patientMovilRepository.deleteToken(existing, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'patient_movil',
                description: `Token removido para paciente #${patient_id}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al remover token: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }
}

module.exports = new PatientMovilService();

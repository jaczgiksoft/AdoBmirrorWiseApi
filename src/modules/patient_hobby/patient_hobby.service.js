const sequelize = require('../../config/database');
const patientHobbyRepository = require('./patient_hobby.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class PatientHobbyService {
    // 🟢 Crear nuevo pasatiempo
    async createPatientHobby(data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const allowedFields = ['tenant_id', 'patient_id', 'name'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            cleanData.tenant_id = currentUser.tenant_id;

            const newHobby = await patientHobbyRepository.createHobby(cleanData, t);
            await t.commit();

            // 🪵 Log de auditoría
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'patient_hobbies',
                description: `Pasatiempo creado para paciente #${newHobby.patient_id}: ${newHobby.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            // 🔔 Notificación informativa
            await notifyUser({
                user_id: currentUser.id,
                title: 'Nuevo pasatiempo agregado',
                message: `${currentUser.username} registró el pasatiempo "${newHobby.name}" para un paciente.`,
                type: 'info'
            });

            return newHobby;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear pasatiempo: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar pasatiempo existente
    async updatePatientHobby(id, data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const hobby = await patientHobbyRepository.findById(id, currentUser.tenant_id);
            if (!hobby) throw new Error('Pasatiempo no encontrado');

            const allowedFields = ['name'];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            await patientHobbyRepository.updateHobby(hobby, cleanData, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'patient_hobbies',
                description: `Pasatiempo actualizado: ${hobby.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return hobby;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar pasatiempo: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar pasatiempo (borrado físico, con log)
    async deletePatientHobby(id, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const t = await sequelize.transaction();
        try {
            const hobby = await patientHobbyRepository.findById(id, currentUser.tenant_id);
            if (!hobby) throw new Error('Pasatiempo no encontrado');

            await patientHobbyRepository.deleteHobby(hobby, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'patient_hobbies',
                description: `Pasatiempo eliminado: ${hobby.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar pasatiempo: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 📋 Obtener todos los pasatiempos de un paciente
    async getHobbiesByPatientId(patientId, currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        return await patientHobbyRepository.findByPatientId(patientId, currentUser.tenant_id);
    }
}

module.exports = new PatientHobbyService();

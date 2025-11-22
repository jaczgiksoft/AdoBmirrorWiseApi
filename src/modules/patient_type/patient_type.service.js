// src/modules/patient_type/patient_type.service.js
const sequelize = require('../../config/database');
const repo = require('./patient_type.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class PatientTypeService {

    async list(currentUser) {
        return await repo.findAllByTenant(currentUser.tenant_id);
    }

    async get(id, currentUser) {
        const type = await repo.findById(id, currentUser.tenant_id);
        if (!type) throw new Error("Tipo de paciente no encontrado");
        return type;
    }

    async create(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const clean = {
                tenant_id: currentUser.tenant_id,
                name: data.name,
                description: data.description || null,
                color: data.color || '#CCCCCC'
            };

            const created = await repo.create(clean, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: "create",
                module: "patient_types",
                description: `Nuevo tipo: ${clean.name}`,
                ip: req.ip,
                user_agent: req.headers["user-agent"],
            });

            return created;

        } catch (err) {
            await t.rollback();
            logger.error(`Error creando tipo paciente: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async update(id, data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const type = await repo.findById(id, currentUser.tenant_id);
            if (!type) throw new Error("Tipo no encontrado");

            await repo.update(type, data, t);
            await t.commit();

            return type;
        } catch (err) {
            await t.rollback();
            await logApiError(req, err);
            throw err;
        }
    }

    async delete(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const type = await repo.findById(id, currentUser.tenant_id);
            if (!type) throw new Error("Tipo no encontrado");

            await repo.softDelete(type, t);
            await t.commit();

            return true;
        } catch (err) {
            await t.rollback();
            await logApiError(req, err);
            throw err;
        }
    }
}

module.exports = new PatientTypeService();

const sequelize = require('../../config/database');
const repo = require('./patient_representative.repository');
const PatientRepresentativeLink = require('../../models/mysql/patient_representative_link.model');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { notifyUser } = require('../../utils/notify.helper');
const { logger } = require('../../utils/logger');

class PatientRepresentativeService {

    async getAll(currentUser) {
        return await repo.findAllByTenant(currentUser.tenant_id);
    }

    async getOne(id, currentUser) {
        const rep = await repo.findById(id, currentUser.tenant_id);
        if (!rep) throw new Error('Representante no encontrado');
        return rep;
    }

    async create(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const allowed = [
                'full_name', 'relationship', 'phone', 'phone_alt',
                'email', 'address',
                'username', 'password', 'can_login', 'first_login'
            ];

            const clean = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowed.includes(key))
            );

            clean.tenant_id = currentUser.tenant_id;
            const created = await repo.create(clean, t);

            // 🔁 Vincular con paciente si se proporciona
            if (data.patient_id) {
                await PatientRepresentativeLink.create({
                    tenant_id: currentUser.tenant_id,
                    patient_id: data.patient_id,
                    representative_id: created.id,
                    is_primary: data.is_primary || false
                }, { transaction: t });
            }

            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'patient_representative',
                description: `Representante creado: ${clean.full_name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            await notifyUser({
                user_id: currentUser.id,
                title: 'Nuevo representante',
                message: `Se registró al representante ${clean.full_name}.`,
                type: 'info'
            });

            return created;

        } catch (err) {
            await t.rollback();
            logger.error(`Error creando representante: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    async update(id, data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const rep = await repo.findById(id, currentUser.tenant_id);
            if (!rep) throw new Error('Representante no encontrado');

            const allowed = [
                'full_name', 'relationship', 'phone', 'phone_alt',
                'email', 'address',
                'username', 'password', 'can_login', 'first_login',
                'is_active'
            ];

            const clean = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowed.includes(key))
            );

            await repo.update(rep, clean, t);

            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'patient_representative',
                description: `Representante actualizado: ${rep.full_name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return rep;

        } catch (err) {
            await t.rollback();
            await logApiError(req, err);
            throw err;
        }
    }

    async delete(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const rep = await repo.findById(id, currentUser.tenant_id);
            if (!rep) throw new Error('Representante no encontrado');

            await repo.softDelete(rep, t);

            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'patient_representative',
                description: `Representante eliminado: ${rep.full_name}`,
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
}

module.exports = new PatientRepresentativeService();

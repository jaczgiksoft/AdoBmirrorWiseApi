const Referral = require('../../models/mysql/referral.model');
const Tenant = require('../../models/mysql/tenant.model');

class ReferralRepository {
    // 🟢 Crear referidor
    async createReferral(data, transaction) {
        return Referral.create(data, { transaction });
    }

    // 🟡 Actualizar referidor
    async updateReferral(referral, data, transaction) {
        return referral.update(data, { transaction });
    }

    // 🔴 Eliminar (borrado físico)
    async deleteReferral(referral, transaction) {
        return referral.destroy({ transaction, force: true });
    }

    // 🔍 Buscar por ID y tenant
    async findById(id, tenantId) {
        return Referral.findOne({
            where: { id, tenant_id: tenantId },
            include: [{ model: Tenant, as: 'tenant', attributes: ['id', 'name'] }],
        });
    }

    // 📋 Listar todos por tenant
    async findAllByTenant(tenantId) {
        return Referral.findAll({
            where: { tenant_id: tenantId },
            order: [['name', 'ASC']],
        });
    }
}

module.exports = new ReferralRepository();

const Occupation = require('../../models/mysql/occupation.model');
const Tenant = require('../../models/mysql/tenant.model');

class OccupationRepository {
    // 🟢 Crear ocupación
    async createOccupation(data, transaction) {
        return Occupation.create(data, { transaction });
    }

    // 🟡 Actualizar ocupación
    async updateOccupation(occupation, data, transaction) {
        return occupation.update(data, { transaction });
    }

    // 🔴 Eliminar (borrado físico)
    async deleteOccupation(occupation, transaction) {
        return occupation.destroy({ transaction });
    }

    // 🔍 Buscar por ID y tenant
    async findById(id, tenantId) {
        return Occupation.findOne({
            where: { id, tenant_id: tenantId },
            include: [{ model: Tenant, as: 'tenant', attributes: ['id', 'name'] }],
        });
    }

    // 📋 Listar todas por tenant
    async findAllByTenant(tenantId) {
        return Occupation.findAll({
            where: { tenant_id: tenantId },
            order: [['name', 'ASC']],
        });
    }
}

module.exports = new OccupationRepository();

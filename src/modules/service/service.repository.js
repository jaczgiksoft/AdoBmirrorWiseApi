const Service = require('../../models/mysql/service.model');

class ServiceRepository {
    // 🟢 Crear servicio
    async createService(data, transaction) {
        return Service.create(data, { transaction });
    }

    // 🟡 Actualizar servicio
    async updateService(service, data, transaction) {
        return service.update(data, { transaction });
    }

    // 🔴 Eliminar servicio (borrado físico/soft delete según modelo)
    async deleteService(service, transaction) {
        return service.destroy({ transaction });
    }

    // 🔍 Buscar servicio por ID (según tenant)
    async findById(id, tenantId) {
        return Service.findOne({
            where: { id, tenant_id: tenantId },
        });
    }

    // 📋 Obtener todos los servicios de un tenant
    async findAllByTenant(tenantId) {
        return Service.findAll({
            where: { tenant_id: tenantId },
            order: [['name', 'ASC']],
        });
    }
}

module.exports = new ServiceRepository();

const { Op } = require('sequelize');
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

    // 📊 Datatable / Listado con búsqueda y paginación
    async datatable(params) {
        const { start, length, searchValue, orderColumn, orderDir, tenant_id } = params;

        const where = { tenant_id };

        if (searchValue && searchValue.trim() !== '') {
            where[Op.or] = [
                { name: { [Op.like]: `%${searchValue}%` } },
                { description: { [Op.like]: `%${searchValue}%` } }
            ];
        }

        const recordsTotal = await Service.count({ where: { tenant_id } });

        // 🧠 Lógica híbrida:
        // Si el front NO envía un orderColumn válido → usar "id DESC"
        const defaultOrder = [["id", "DESC"]];

        const finalOrder = orderColumn
            ? [[orderColumn, orderDir || "ASC"]]
            : defaultOrder;

        const { rows, count: recordsFiltered } = await Service.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: finalOrder,
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new ServiceRepository();

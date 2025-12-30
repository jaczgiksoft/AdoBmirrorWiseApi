const { Op } = require('sequelize');
const ClinicArea = require('../../models/mysql/clinic_area.model');

class ClinicAreaRepository {
    // 🟢 Crear área clínica
    async createClinicArea(data, transaction) {
        return ClinicArea.create(data, { transaction });
    }

    // 🟡 Actualizar área clínica
    async updateClinicArea(clinicArea, data, transaction) {
        return clinicArea.update(data, { transaction });
    }

    // 🔴 Eliminar área clínica (borrado físico/soft delete según modelo)
    async deleteClinicArea(clinicArea, transaction) {
        return clinicArea.destroy({ transaction });
    }

    // 🔍 Buscar área clínica por ID (según tenant)
    async findById(id, tenantId) {
        return ClinicArea.findOne({
            where: { id, tenant_id: tenantId },
        });
    }

    // 📋 Obtener todas las áreas clínicas de un tenant
    async findAllByTenant(tenantId) {
        return ClinicArea.findAll({
            where: { tenant_id: tenantId },
            order: [['name', 'ASC']],
        });
    }

    // 📊 Datatable / Listado con búsqueda y paginación
    async datatable(params) {
        const { start, length, searchValue, orderColumn, orderDir, tenant_id, statusFilter } = params;

        const where = { tenant_id };

        if (searchValue && searchValue.trim() !== '') {
            where[Op.or] = [
                { name: { [Op.like]: `%${searchValue}%` } }
            ];
        }

        if (statusFilter && statusFilter.trim() !== '') {
            where.status = statusFilter;
        }

        const recordsTotal = await ClinicArea.count({ where: { tenant_id } });

        // 🧠 Lógica híbrida:
        // Si el front NO envía un orderColumn válido → usar "id DESC"
        const defaultOrder = [["id", "DESC"]];

        const finalOrder = orderColumn
            ? [[orderColumn, orderDir || "ASC"]]
            : defaultOrder;

        const { rows, count: recordsFiltered } = await ClinicArea.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: finalOrder,
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new ClinicAreaRepository();

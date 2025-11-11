const Department = require('../../models/mysql/department.model');
const { Op } = require('sequelize');

class DepartmentRepository {
    /**
     * 🔹 Obtener todos los departamentos de un tenant
     */
    async findAll(tenantId) {
        return Department.findAll({
            where: { tenant_id: tenantId },
            order: [['name', 'ASC']],
            attributes: [
                'id',
                'name',
                'description',
                'profit_margin',
                'use_parent_profit_margin',
                'status',
                'created_at',
            ],
        });
    }

    /**
     * 🔹 Buscar por ID
     */
    async findById(id, tenantId) {
        return Department.findOne({
            where: { id, tenant_id: tenantId },
            attributes: [
                'id',
                'tenant_id',
                'name',
                'description',
                'profit_margin',
                'use_parent_profit_margin',
                'status',
                'created_at',
                'updated_at',
            ],
        });
    }

    /**
     * 🔹 Buscar por nombre (case-insensitive)
     */
    async findByName(name, tenantId) {
        return Department.findOne({
            where: {
                tenant_id: tenantId,
                name: { [Op.iLike]: name.trim() },
            },
        });
    }

    /**
     * 🔹 Crear departamento
     */
    async createDepartment(data, transaction) {
        return Department.create(data, { transaction });
    }

    /**
     * 🔹 Actualizar departamento
     */
    async updateDepartment(department, data, transaction) {
        return department.update(data, { transaction });
    }

    /**
     * 🔹 Eliminación lógica (soft delete)
     */
    async softDeleteDepartment(department, transaction) {
        department.status = 'inactive';
        await department.save({ transaction });
        await department.destroy({ transaction }); // Sequelize soft delete (paranoid)
    }

    /**
     * 🔹 Datatable con filtros y búsqueda
     */
    async datatable(params, tenantId) {
        const { start, length, searchValue, orderColumn, orderDir, statusFilter } = params;

        const andConditions = [{ tenant_id: tenantId }];

        // 🔍 Filtro de búsqueda global
        if (searchValue && searchValue.trim() !== '') {
            andConditions.push({
                [Op.or]: [
                    { name: { [Op.like]: `%${searchValue}%` } },
                    { description: { [Op.like]: `%${searchValue}%` } },
                    { status: { [Op.like]: `%${searchValue}%` } },
                ],
            });
        }

        // 🔘 Filtro por estado
        if (statusFilter && statusFilter.trim() !== '') {
            andConditions.push({ status: statusFilter.trim() });
        }

        const where = { [Op.and]: andConditions };

        // 🔢 Total de registros
        const recordsTotal = await Department.count({ where: { tenant_id: tenantId } });

        // 🔎 Registros filtrados
        const { rows, count: recordsFiltered } = await Department.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]],
            attributes: [
                'id',
                'name',
                'description',
                'profit_margin',
                'use_parent_profit_margin',
                'status',
                'created_at',
            ],
        });

        return { recordsTotal, recordsFiltered, rows };
    }
}

module.exports = new DepartmentRepository();

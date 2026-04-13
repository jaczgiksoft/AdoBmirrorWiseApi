const { Op } = require('sequelize');
const Employee = require('../../models/mysql/employee.model');
const Tenant = require('../../models/mysql/tenant.model');
const Role = require('../../models/mysql/role.model');
const Position = require('../../models/mysql/position.model');

class EmployeeRepository {
    // 📋 Obtener todos los empleados de un tenant
    async findAllByTenant(tenantId) {
        return Employee.findAll({
            where: { tenant_id: tenantId },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
                { model: Role, as: 'role', attributes: ['id', 'name'] },
                { model: Position, as: 'positions', attributes: ['id', 'name', 'color'], through: { attributes: [] } }
            ],
            order: [['first_name', 'ASC'], ['last_name', 'ASC']]
        });
    }

    // 🔍 Buscar empleado por ID y tenant
    async findById(id, tenantId) {
        return Employee.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
                { model: Role, as: 'role', attributes: ['id', 'name'] },
                { model: Position, as: 'positions', attributes: ['id', 'name', 'color'], through: { attributes: [] } }
            ]
        });
    }

    // 🟢 Crear empleado
    async create(data, transaction) {
        return Employee.create(data, { transaction });
    }

    // 🟡 Actualizar empleado
    async update(employee, data, transaction) {
        return employee.update(data, { transaction });
    }

    // 🔴 Eliminación lógica (soft delete)
    async softDelete(employee, transaction) {
        await employee.destroy({ transaction });
    }

    // 📊 Datatable / Listado con búsqueda y paginación
    async datatable(params) {
        const { start, length, searchValue, orderColumn, orderDir, tenant_id, statusFilter } = params;

        const where = { tenant_id };

        // Filtro de estado opcional
        if (statusFilter) {
            where.status = statusFilter;
        }

        if (searchValue && searchValue.trim() !== '') {
            where[Op.or] = [
                { first_name: { [Op.like]: `%${searchValue}%` } },
                { last_name: { [Op.like]: `%${searchValue}%` } },
                { second_last_name: { [Op.like]: `%${searchValue}%` } },
                { email: { [Op.like]: `%${searchValue}%` } },
                { phone: { [Op.like]: `%${searchValue}%` } }
            ];
        }

        const recordsTotal = await Employee.count({ where: { tenant_id } });

        // Ordenamiento
        const defaultOrder = [["id", "DESC"]];
        const finalOrder = orderColumn
            ? [[orderColumn, orderDir || "ASC"]]
            : defaultOrder;

        const { rows, count: recordsFiltered } = await Employee.findAndCountAll({
            where,
            include: [
                { model: Role, as: 'role', attributes: ['id', 'name'] },
                { model: Position, as: 'positions', attributes: ['id', 'name', 'color'], through: { attributes: [] } }
            ],
            offset: start,
            limit: length,
            order: finalOrder,
            distinct: true // Necesario para evitar conteo erróneo con relaciones Many-to-Many
        });

        return { recordsTotal, recordsFiltered, rows };
    }

    // 👨‍⚕️ Obtener doctores (empleados elegibles para citas)
    async findDoctors(tenantId) {
        return Employee.findAll({
            where: {
                tenant_id: tenantId,
                is_appointment_eligible: true,
                status: 'active'
            },
            attributes: ['id', 'first_name', 'last_name', 'profile_image'],
            include: [
                { model: Position, as: 'positions', attributes: ['id', 'name'], through: { attributes: [] } }
            ],
            order: [['first_name', 'ASC']]
        });
    }
}

module.exports = new EmployeeRepository();

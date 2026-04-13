const sequelize = require('../../config/database');
const employeeRepository = require('./employee.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

class EmployeeService {

    // 📋 Obtener todos (raw)
    async getAllEmployees(currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');
        return await employeeRepository.findAllByTenant(currentUser.tenant_id);
    }

    // 🔍 Obtener uno por ID
    async getEmployeeById(id, currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');
        const employee = await employeeRepository.findById(id, currentUser.tenant_id);
        if (!employee) throw new Error('Empleado no encontrado');
        return employee;
    }

    // 🟢 Crear
    async createEmployee(data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');

        const t = await sequelize.transaction();
        try {
            const payload = {
                ...data,
                tenant_id: currentUser.tenant_id
            };

            const newEmployee = await employeeRepository.create(payload, t);

            // 🛠️ Asociar los puestos
            if (data.positionIds && data.positionIds.length > 0) {
                await newEmployee.setPositions(data.positionIds, { transaction: t });
            }

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'employees',
                description: `Empleado creado: ${newEmployee.first_name} ${newEmployee.last_name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            await t.commit();
            return await employeeRepository.findById(newEmployee.id, currentUser.tenant_id);
        } catch (err) {
            await t.rollback();
            logger.error(`Error creando empleado: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar
    async updateEmployee(id, data, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');

        const t = await sequelize.transaction();
        try {
            const employee = await employeeRepository.findById(id, currentUser.tenant_id);
            if (!employee) throw new Error('Empleado no encontrado');

            await employeeRepository.update(employee, data, t);

            // 🛠️ Sincronizar puestos
            if (data.positionIds) {
                await employee.setPositions(data.positionIds, { transaction: t });
            }

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'employees',
                description: `Empleado actualizado: ${employee.first_name} ${employee.last_name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            await t.commit();
            return await employeeRepository.findById(id, currentUser.tenant_id);
        } catch (err) {
            await t.rollback();
            logger.error(`Error actualizando empleado: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar
    async deleteEmployee(id, currentUser, req) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');

        const t = await sequelize.transaction();
        try {
            const employee = await employeeRepository.findById(id, currentUser.tenant_id);
            if (!employee) throw new Error('Empleado no encontrado');

            // TODO: Validar si tiene usuario asociado antes de borrar?
            // El modelo User tiene constraint, así que fallaría si hay usuario.
            // Dejamos que falle o atrapamos el error de FK si fuera DELETE estricto.
            // Al ser softDelete, no rompe la FK del usuario a menos que el usuario verifique soft deletes?
            // User.employee_id referencia employees.id. Soft delete mantiene el row.

            await employeeRepository.softDelete(employee, t);

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'employees',
                description: `Empleado eliminado: ${employee.first_name} ${employee.last_name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            await t.commit();
            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error eliminando empleado: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 📊 Datatable
    async getDatatable(body, currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');

        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;
        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();
        const statusFilter = body.statusFilter || '';

        const columns = [null, 'first_name', 'position', 'email', 'phone', 'status']; // Ajustar según lo que mande el front
        const orderColumn = columns[orderColumnIndex] || 'id';

        const params = {
            start,
            length,
            searchValue,
            orderColumn,
            orderDir,
            tenant_id: currentUser.tenant_id,
            statusFilter
        };

        const { recordsTotal, recordsFiltered, rows } = await employeeRepository.datatable(params);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }

    // 👨‍⚕️ Obtener doctores para selects
    async getDoctors(currentUser) {
        if (!currentUser.tenant_id) throw new Error('No autorizado: falta tenant');
        return await employeeRepository.findDoctors(currentUser.tenant_id);
    }
}

module.exports = new EmployeeService();

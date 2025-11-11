const sequelize = require('../../config/database');
const departmentRepository = require('./department.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');

class DepartmentService {
    /**
     * Obtener todos los departamentos del tenant actual
     */
    async getAllDepartments(currentUser) {
        return departmentRepository.findAll(currentUser.tenant_id);
    }

    /**
     * Obtener un departamento por ID
     */
    async getDepartmentById(id, currentUser) {
        const department = await departmentRepository.findById(id, currentUser.tenant_id);
        if (!department) throw new Error('Departamento no encontrado');
        return department;
    }

    /**
     * Crear un nuevo departamento
     */
    async createDepartment(data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            // 🔹 Validar nombre duplicado
            if (await departmentRepository.findByName(data.name, currentUser.tenant_id)) {
                throw new Error('El nombre del departamento ya está en uso');
            }

            // 🔹 Validación lógica de margen
            if (data.use_parent_profit_margin === false && (data.profit_margin == null)) {
                throw new Error(
                    'Debes especificar un margen de ganancia si no se usa el margen del nivel superior'
                );
            }

            // 🔹 Normalización de valores
            const departmentPayload = {
                tenant_id: currentUser.tenant_id,
                name: data.name.trim(),
                description: data.description?.trim() || null,
                profit_margin: data.profit_margin ?? null,
                use_parent_profit_margin: data.use_parent_profit_margin ?? true,
                status: data.status ?? 'active',
            };

            // 🔹 Crear registro
            const newDepartment = await departmentRepository.createDepartment(departmentPayload, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'departments',
                description: `Departamento creado: ${newDepartment.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Nuevo departamento creado',
                message: `${currentUser.username} ha creado el departamento ${newDepartment.name}.`,
                type: 'system',
            });

            return newDepartment;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear departamento: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    /**
     * Actualizar un departamento existente
     */
    async updateDepartment(id, data, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const department = await departmentRepository.findById(id, currentUser.tenant_id);
            if (!department) throw new Error('Departamento no encontrado');

            // 🔹 Validar nombre duplicado
            if (data.name && data.name !== department.name) {
                if (await departmentRepository.findByName(data.name, currentUser.tenant_id)) {
                    throw new Error('Ese nombre ya está en uso en tu tenant');
                }
            }

            // 🔹 Validación lógica de margen
            if (data.use_parent_profit_margin === false && (data.profit_margin == null)) {
                throw new Error(
                    'Debes especificar un margen de ganancia si no se usa el margen del nivel superior'
                );
            }

            // 🔹 Normalización de datos
            const updatedData = {
                name: data.name?.trim() ?? department.name,
                description: data.description?.trim() ?? department.description,
                profit_margin:
                    data.use_parent_profit_margin === false
                        ? data.profit_margin ?? department.profit_margin
                        : null, // Si se hereda margen, limpiar campo local
                use_parent_profit_margin:
                    data.use_parent_profit_margin ?? department.use_parent_profit_margin,
                status: data.status ?? department.status,
            };

            await departmentRepository.updateDepartment(department, updatedData, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'departments',
                description: `Departamento actualizado: ${department.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Departamento actualizado',
                message: `El departamento ${department.name} ha sido actualizado por ${currentUser.username}.`,
                type: 'system',
            });

            return department;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar departamento: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    /**
     * Eliminación lógica (soft delete)
     */
    async deleteDepartment(id, currentUser, req) {
        const t = await sequelize.transaction();
        try {
            const department = await departmentRepository.findById(id, currentUser.tenant_id);
            if (!department) throw new Error('Departamento no encontrado');

            await departmentRepository.softDeleteDepartment(department, t);
            await t.commit();

            // 🧾 Log
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'departments',
                description: `Departamento eliminado: ${department.name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent'],
            });

            // 🔔 Notificación global
            await notifyUser({
                user_id: currentUser.id,
                tenant_id: currentUser.tenant_id,
                title: 'Departamento eliminado',
                message: `${currentUser.username} ha eliminado el departamento ${department.name}.`,
                type: 'system',
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar departamento: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    /**
     * Datatable con paginación y búsqueda
     */
    async getDepartmentsDatatable(body, currentUser) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;

        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'name', 'profit_margin', 'status', 'id'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const statusFilter =
            body['columns[3][search][value]'] || (body.columns?.[3]?.search?.value ?? '');

        const params = { start, length, searchValue, orderColumn, orderDir, statusFilter };

        const { recordsTotal, recordsFiltered, rows } =
            await departmentRepository.datatable(params, currentUser.tenant_id);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new DepartmentService();

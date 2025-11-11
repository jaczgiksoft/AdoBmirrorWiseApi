const departmentService = require('./department.service');

/**
 * Obtener todos los departamentos del tenant actual
 */
const getAll = async (req, res) => {
    try {
        const departments = await departmentService.getAllDepartments(req.user);
        return res.status(200).json(departments);
    } catch (err) {
        return res.status(403).json({ message: err.message });
    }
};

/**
 * Obtener un departamento por ID
 */
const getOne = async (req, res) => {
    try {
        const department = await departmentService.getDepartmentById(req.params.id, req.user);
        if (!department) {
            return res.status(404).json({ message: 'Departamento no encontrado' });
        }
        return res.status(200).json(department);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

/**
 * Crear un nuevo departamento
 */
const create = async (req, res) => {
    try {
        // Validación lógica adicional
        const { use_parent_profit_margin, profit_margin } = req.body;
        if (use_parent_profit_margin === false && (profit_margin === null || profit_margin === undefined)) {
            return res.status(400).json({
                message: 'Debes especificar un margen de ganancia si no se usa el margen del nivel superior',
            });
        }

        const department = await departmentService.createDepartment(req.body, req.user, req);
        return res.status(201).json({
            message: 'Departamento creado correctamente',
            department,
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

/**
 * Actualizar un departamento existente
 */
const update = async (req, res) => {
    try {
        // Validación lógica adicional
        const { use_parent_profit_margin, profit_margin } = req.body;
        if (use_parent_profit_margin === false && (profit_margin === null || profit_margin === undefined)) {
            return res.status(400).json({
                message: 'Debes especificar un margen de ganancia si no se usa el margen del nivel superior',
            });
        }

        const department = await departmentService.updateDepartment(req.params.id, req.body, req.user, req);
        return res.status(200).json({
            message: 'Departamento actualizado correctamente',
            department,
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

/**
 * Eliminación lógica (soft delete)
 */
const softDelete = async (req, res) => {
    try {
        await departmentService.deleteDepartment(req.params.id, req.user, req);
        return res.status(200).json({ message: 'Departamento eliminado correctamente' });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

/**
 * Endpoint para datatables (paginación, filtros, etc.)
 */
const getDatatable = async (req, res) => {
    try {
        const result = await departmentService.getDepartmentsDatatable(req.body, req.user);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAll,
    getOne,
    create,
    update,
    softDelete,
    getDatatable,
};

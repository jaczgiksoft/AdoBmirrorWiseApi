// src/modules/positions/position.controller.js
const positionService = require('./position.service');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

const getPositions = async (req, res) => {
    try {
        const positions = await positionService.getAllPositions(req.user.tenant_id);
        res.status(200).send(positions);
    } catch (err) {
        logger.error(`Error al obtener puestos: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
    }
};

const getPosition = async (req, res) => {
    try {
        const position = await positionService.getPositionById(req.params.id, req.user.tenant_id);
        res.status(200).send(position);
    } catch (err) {
        logger.error(`Error al obtener puesto: ${err.message}`);
        await logApiError(req, err);
        res.status(404).json({ success: false, message: err.message });
    }
};

const createPosition = async (req, res) => {
    try {
        const { name, description, color, isAppointmentEligible } = req.body;
        
        // Mapeo camelCase -> snake_case para la DB
        const data = {
            name,
            description,
            color,
            is_appointment_eligible: isAppointmentEligible || false
        };

        const position = await positionService.createPosition(data, req.user.tenant_id);
        res.status(201).send(position);
    } catch (err) {
        logger.error(`Error al crear puesto: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
    }
};

const updatePosition = async (req, res) => {
    try {
        const { name, description, color, isAppointmentEligible } = req.body;
        
        // Mapeo camelCase -> snake_case para la DB
        const data = {};
        if (name !== undefined) data.name = name;
        if (description !== undefined) data.description = description;
        if (color !== undefined) data.color = color;
        if (isAppointmentEligible !== undefined) data.is_appointment_eligible = isAppointmentEligible;

        const position = await positionService.updatePosition(req.params.id, data, req.user.tenant_id);
        res.status(200).send(position);
    } catch (err) {
        logger.error(`Error al actualizar puesto: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
    }
};

const deletePosition = async (req, res) => {
    try {
        const result = await positionService.deletePosition(req.params.id, req.user.tenant_id);
        res.status(200).send(result);
    } catch (err) {
        logger.error(`Error al eliminar puesto: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
    }
};

const datatable = async (req, res) => {
    try {
        const result = await positionService.getDatatable(req.body, req.user.tenant_id);
        res.status(200).send(result);
    } catch (err) {
        logger.error(`Error en datatable de puestos: ${err.message}`);
        await logApiError(req, err);
        res.status(400).json({ success: false, message: err.message });
    }
};

module.exports = {
    getPositions,
    getPosition,
    createPosition,
    updatePosition,
    deletePosition,
    datatable
};

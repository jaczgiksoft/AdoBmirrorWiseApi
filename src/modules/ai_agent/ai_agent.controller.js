const employeeService = require('../employee/employee.service');
const serviceService = require('../service/service.service');
const aiAgentService = require('./ai_agent.service');
const { handleSequelizeError } = require('../../utils/sequelizeErrorHandler');

/**
 * Módulo de Chat interactivo con la IA.
 * @param {Object} req - Request (req.body debe tener patient_id y message)
 * @param {Object} res - Response
 */
const handleChat = async (req, res) => {
    try {
        const { patient_id, message } = req.body;
        
        if (!patient_id || !message) {
            return res.status(400).json({ message: 'patient_id y message son requeridos' });
        }

        const response = await aiAgentService.processChat(patient_id, message, req.user, req);
        
        res.json({
            success: true,
            data: response
        });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

/**
 * Consolida la información de servicios y doctores disponibles para el agente de IA.
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 */
const getAvailableServicesAndDoctors = async (req, res) => {
    try {
        // Obtenemos servicios y doctores en paralelo
        const [servicesRaw, doctorsRaw] = await Promise.all([
            serviceService.getAllServices(req.user),
            employeeService.getDoctors(req.user)
        ]);

        // Formateamos servicios: id, name, price
        const services = servicesRaw.map(s => ({
            id: s.id,
            name: s.name,
            price: s.price
        }));

        // Formateamos doctores: id, full_name, specialty
        // Concatenamos posiciones para la especialidad
        const doctors = doctorsRaw.map(d => ({
            id: d.id,
            full_name: `${d.first_name} ${d.last_name}`.trim(),
            specialty: d.positions && d.positions.length > 0 
                ? d.positions.map(p => p.name).join(', ') 
                : 'General'
        }));

        res.json({
            services,
            doctors
        });
    } catch (err) {
        handleSequelizeError(res, err);
    }
};

module.exports = {
    handleChat,
    getAvailableServicesAndDoctors
};

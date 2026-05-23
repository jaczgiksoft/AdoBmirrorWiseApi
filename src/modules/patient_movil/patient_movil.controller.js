const patientMovilService = require('./patient_movil.service');
const { formatSuccessResponse, formatErrorResponse } = require('../../utils/response.util');

/**
 * Register or update push token
 */
const registerToken = async (req, res) => {
    try {
        const { token } = req.body;
        const tenant_id = req.user.tenant_id;
        // In some contexts the mobile app sends patient_id or it's from the logged-in user
        const patient_id = req.body.patient_id || req.user.id; 

        if (!token || !patient_id) {
            return res.status(400).json(formatErrorResponse(
                'Faltan datos requeridos: token o patient_id',
                'VALIDATION_ERROR'
            ));
        }

        const data = await patientMovilService.registerToken(tenant_id, patient_id, token);

        return res.status(200).json(formatSuccessResponse(
            data,
            'Token registrado exitosamente'
        ));
    } catch (error) {
        console.error('Error in registerToken:', error);
        return res.status(500).json(formatErrorResponse(
            error.message || 'Error interno del servidor',
            error.name || 'INTERNAL_ERROR'
        ));
    }
};

/**
 * Remove push token
 */
const removeToken = async (req, res) => {
    try {
        const { token } = req.body;
        const tenant_id = req.user.tenant_id;
        const patient_id = req.body.patient_id || req.user.id;

        if (!token) {
            return res.status(400).json(formatErrorResponse(
                'Falta el token',
                'VALIDATION_ERROR'
            ));
        }

        await patientMovilService.removeToken(tenant_id, patient_id, token);

        return res.status(200).json(formatSuccessResponse(
            null,
            'Token removido exitosamente'
        ));
    } catch (error) {
        console.error('Error in removeToken:', error);
        return res.status(500).json(formatErrorResponse(
            error.message || 'Error interno del servidor',
            error.name || 'INTERNAL_ERROR'
        ));
    }
};

module.exports = {
    registerToken,
    removeToken
};

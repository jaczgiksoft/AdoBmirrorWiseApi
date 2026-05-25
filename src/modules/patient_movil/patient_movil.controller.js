const patientMovilService = require('./patient_movil.service');

// 🟢 Registrar o actualizar token
const registerToken = async (req, res) => {
    try {
        const data = await patientMovilService.registerToken(req.body, req.user, req);
        res.status(200).json({ message: 'Token registrado exitosamente', data });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🔴 Remover token
const removeToken = async (req, res) => {
    try {
        await patientMovilService.removeToken(req.body, req.user, req);
        res.json({ message: 'Token removido exitosamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    registerToken,
    removeToken
};

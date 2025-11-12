const patientHobbyService = require('./patient_hobby.service');

// 🟢 Crear nuevo pasatiempo para un paciente
const create = async (req, res) => {
    try {
        const hobby = await patientHobbyService.createPatientHobby(req.body, req.user, req);
        res.status(201).json({ message: 'Pasatiempo creado exitosamente', hobby });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟡 Actualizar un pasatiempo existente
const update = async (req, res) => {
    try {
        const hobby = await patientHobbyService.updatePatientHobby(req.params.id, req.body, req.user, req);
        res.json({ message: 'Pasatiempo actualizado exitosamente', hobby });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🔴 Eliminar pasatiempo (borrado físico con log)
const remove = async (req, res) => {
    try {
        await patientHobbyService.deletePatientHobby(req.params.id, req.user, req);
        res.json({ message: 'Pasatiempo eliminado correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 📋 Obtener todos los pasatiempos de un paciente
const getByPatient = async (req, res) => {
    try {
        const hobbies = await patientHobbyService.getHobbiesByPatientId(req.params.patient_id, req.user);
        res.json(hobbies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    create,
    update,
    remove,
    getByPatient,
};

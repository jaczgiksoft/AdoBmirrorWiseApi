const extractionService = require('./patient_extraction.service');

// 🟢 Crear Orden
const create = async (req, res) => {
    try {
        // Multipart form-data:
        // req.body.order -> JSON string
        // req.body.teeth -> JSON string
        // req.files -> Array of files

        // Parse JSON strings back to objects
        let orderData = {};
        let teethData = [];

        try {
            orderData = typeof req.body.order === 'string' ? JSON.parse(req.body.order) : req.body.order;
            teethData = typeof req.body.teeth === 'string' ? JSON.parse(req.body.teeth) : req.body.teeth;
        } catch (e) {
            return res.status(400).json({ message: 'Formato JSON inválido en order o teeth.' });
        }

        // Validate basic requirement
        const patientId = req.params.patient_id || req.body.patient_id;
        if (!patientId) {
            return res.status(400).json({ message: 'Patient ID es requerido.' });
        }

        const payload = {
            patient_id: patientId,
            order: orderData,
            teeth: teethData
        };

        const result = await extractionService.createExtractionOrder(payload, req.user, req.files);
        res.status(201).json(result);

    } catch (err) {
        console.error("Error creando orden:", err);
        res.status(400).json({ message: err.message });
    }
};

// 🔍 Listar por Paciente
const getByPatient = async (req, res) => {
    try {
        const extractions = await extractionService.getPatientExtractions(req.params.patient_id, req.user);
        res.json(extractions);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🔍 Detalle por ID
const getOne = async (req, res) => {
    try {
        const extraction = await extractionService.getExtractionById(req.params.id, req.user);
        if (!extraction) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }
        res.json(extraction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// ✏️ Actualizar Orden
const update = async (req, res) => {
    try {
        let orderData = {};
        let teethData = [];

        try {
            orderData = typeof req.body.order === 'string' ? JSON.parse(req.body.order) : req.body.order;
            teethData = typeof req.body.teeth === 'string' ? JSON.parse(req.body.teeth) : req.body.teeth;
        } catch (e) {
            return res.status(400).json({ message: 'Formato JSON inválido en order o teeth.' });
        }

        const payload = {
            id: req.params.id,
            patient_id: req.body.patient_id,
            order: orderData,
            teeth: teethData
        };

        const result = await extractionService.updateExtractionOrder(payload, req.user, req.files);
        res.json(result);

    } catch (err) {
        console.error("Error actualizando orden:", err);
        res.status(400).json({ message: err.message });
    }
};

// 🔴 Eliminar
const remove = async (req, res) => {
    try {
        await extractionService.deleteExtractionOrder(req.params.id, req.user);
        res.json({ message: 'Orden eliminada correctamente' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    create,
    getByPatient,
    getByPatient,
    getOne,
    update,
    remove
};

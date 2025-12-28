const PatientExtraction = require('../../models/mysql/patient_extraction.model');
const ExtractionTooth = require('../../models/mysql/extraction_tooth.model');
const ExtractionFile = require('../../models/mysql/extraction_file.model');

// 🟢 Crear orden completa (con transacción externa)
const create = async (data, transaction) => {
    return await PatientExtraction.create(data, { transaction });
};

// 🦷 Agregar dientes a la orden
const addTeeth = async (teethData, transaction) => {
    return await ExtractionTooth.bulkCreate(teethData, { transaction });
};

// 📂 Agregar archivos a la orden
const addFiles = async (filesData, transaction) => {
    return await ExtractionFile.bulkCreate(filesData, { transaction });
};

// 🔍 Obtener todas las órdenes de un paciente, filtrado por tenant
const getAllByPatient = async (patientId, tenantId) => {
    return await PatientExtraction.findAll({
        where: {
            patient_id: patientId,
            tenant_id: tenantId
        },
        include: [
            { model: ExtractionTooth, as: 'teeth' },
            { model: ExtractionFile, as: 'files' }
        ],
        order: [['date', 'DESC'], ['id', 'DESC']]
    });
};

// 🔍 Obtener una orden por ID y Tenant
const getById = async (id, tenantId) => {
    return await PatientExtraction.findOne({
        where: {
            id,
            tenant_id: tenantId
        },
        include: [
            { model: ExtractionTooth, as: 'teeth' },
            { model: ExtractionFile, as: 'files' }
        ]
    });
};

// 🔴 Eliminar orden
const remove = async (id, tenantId) => {
    return await PatientExtraction.destroy({
        where: {
            id,
            tenant_id: tenantId
        }
    });
};

// ✏️ Actualizar header
const update = async (id, data, transaction) => {
    return await PatientExtraction.update(data, {
        where: { id },
        transaction
    });
};

// 🧹 Limpiar dientes (para update)
const removeAllTeeth = async (patientExtractionId, transaction) => {
    return await ExtractionTooth.destroy({
        where: { patient_extraction_id: patientExtractionId },
        transaction
    });
};

module.exports = {
    create,
    update,
    addTeeth,
    removeAllTeeth,
    addFiles,
    getAllByPatient,
    getById,
    remove
};

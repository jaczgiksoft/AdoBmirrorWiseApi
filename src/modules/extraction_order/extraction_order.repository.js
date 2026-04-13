const PatientExtractionOrder = require('../../models/mysql/patient_extraction_order.model');
const ExtractionOrderTooth = require('../../models/mysql/extraction_order_tooth.model');
const ExtractionOrderFile = require('../../models/mysql/extraction_order_file.model');

const createOrder = async (orderData, transaction) => {
    return await PatientExtractionOrder.create(orderData, { transaction });
};

const createTeeth = async (teethData, transaction) => {
    return await ExtractionOrderTooth.bulkCreate(teethData, { transaction });
};

const createFiles = async (filesData, transaction) => {
    return await ExtractionOrderFile.bulkCreate(filesData, { transaction });
};

const findAllByPatientId = async (patientId, tenantId) => {
    return await PatientExtractionOrder.findAll({
        where: { patient_id: patientId, tenant_id: tenantId },
        include: [
            { model: ExtractionOrderTooth, as: 'teeth' },
            { model: ExtractionOrderFile, as: 'files' }
        ],
        order: [['created_at', 'DESC']]
    });
};

const findById = async (id, tenantId) => {
    return await PatientExtractionOrder.findOne({
        where: { id, tenant_id: tenantId },
        include: [
            { model: ExtractionOrderTooth, as: 'teeth' },
            { model: ExtractionOrderFile, as: 'files' }
        ]
    });
};

const updateOrder = async (id, orderData, transaction) => {
    return await PatientExtractionOrder.update(orderData, {
        where: { id },
        transaction
    });
};

const deleteTeethByOrderId = async (orderId, transaction) => {
    return await ExtractionOrderTooth.destroy({
        where: { extraction_order_id: orderId },
        transaction
    });
};

const deleteOrder = async (id, tenantId) => {
    return await PatientExtractionOrder.destroy({
        where: { id, tenant_id: tenantId }
    });
};

module.exports = {
    createOrder,
    createTeeth,
    createFiles,
    findAllByPatientId,
    findById,
    updateOrder,
    deleteTeethByOrderId,
    deleteOrder
};

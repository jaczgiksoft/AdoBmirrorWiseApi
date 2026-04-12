const sequelize = require('../../config/database');
const repo = require('./extraction_order.repository');
const path = require('path');
const fs = require('fs');

const createOrder = async (data, user, files = []) => {
    const transaction = await sequelize.transaction();
    try {
        const orderPayload = {
            tenant_id: user.tenant_id,
            patient_id: data.patient_id,
            doctor_id: data.doctor_id || user.employee_id || null,
            clinical_reason: data.clinical_reason,
            notes: data.notes,
            status: data.status || 'pending',
            order_date: data.order_date
        };

        const order = await repo.createOrder(orderPayload, transaction);

        if (data.teeth && data.teeth.length > 0) {
            const teethPayload = data.teeth.map(t => ({
                extraction_order_id: order.id,
                tooth_id: t.tooth_id,
                extraction: t.extraction,
                areas: t.areas
            }));
            await repo.createTeeth(teethPayload, transaction);
        }

        if (files && files.length > 0) {
            const filesPayload = files.map(file => {
                const cleanPath = file.path.replace(/^.*uploads[\\/]/, "uploads/");
                const normalizePath = cleanPath.replace(/\\/g, "/");

                return {
                    extraction_order_id: order.id,
                    filename: file.filename,
                    path: normalizePath,
                    mimetype: file.mimetype,
                    size: file.size
                };
            });
            await repo.createFiles(filesPayload, transaction);
        }

        await transaction.commit();
        return await repo.findById(order.id, user.tenant_id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getOrdersByPatient = async (patientId, tenantId) => {
    return await repo.findAllByPatientId(patientId, tenantId);
};

const getOrderById = async (id, tenantId) => {
    return await repo.findById(id, tenantId);
};

const updateOrder = async (id, data, user) => {
    const transaction = await sequelize.transaction();
    try {
        const order = await repo.findById(id, user.tenant_id);
        if (!order) throw new Error('Order not found');

        const orderPayload = {
            clinical_reason: data.clinical_reason,
            notes: data.notes,
            status: data.status,
            order_date: data.order_date
        };

        await repo.updateOrder(id, orderPayload, transaction);

        if (data.teeth) {
            await repo.deleteTeethByOrderId(id, transaction);
            const teethPayload = data.teeth.map(t => ({
                extraction_order_id: id,
                tooth_id: t.tooth_id,
                extraction: t.extraction,
                areas: t.areas
            }));
            await repo.createTeeth(teethPayload, transaction);
        }

        // Files update logic could be added here if needed (e.g. deleting specific files)

        await transaction.commit();
        return await repo.findById(id, user.tenant_id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const deleteOrder = async (id, tenantId) => {
    const order = await repo.findById(id, tenantId);
    if (!order) throw new Error('Order not found');

    // Delete physical files
    if (order.files && order.files.length > 0) {
        order.files.forEach(file => {
            const absolutePath = path.join(process.cwd(), file.path);
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        });
    }

    return await repo.deleteOrder(id, tenantId);
};

module.exports = {
    createOrder,
    getOrdersByPatient,
    getOrderById,
    updateOrder,
    deleteOrder
};

const fs = require('fs');
const path = require('path');
const sequelize = require('../../config/database');
const extractionRepo = require('./patient_extraction.repository');
const { getPatientById } = require('../patient/patient.service');

// 🟢 Crear orden de extracción
const createExtractionOrder = async (data, user, files) => {
    const transaction = await sequelize.transaction();

    try {
        // 1. Verificar si el paciente existe y pertenece al tenant
        const patient = await getPatientById(data.patient_id, user);
        if (!patient) {
            throw new Error('El paciente no existe o no tienes acceso a él.');
        }

        // 2. Preparar datos de la orden
        const orderData = {
            ...data.order,
            tenant_id: user.tenant_id,
            patient_id: data.patient_id
        };

        // 3. Crear cabecera de orden
        const newOrder = await extractionRepo.create(orderData, transaction);

        // 4. Preparar y crear detalles de dientes
        if (data.teeth && data.teeth.length > 0) {
            const teethData = data.teeth.map(t => ({
                patient_extraction_id: newOrder.id,
                tooth_id: t.tooth,
                extraction: t.extraction,
                areas: t.areas // Sequelize maneja la serialización JSON
            }));
            await extractionRepo.addTeeth(teethData, transaction);
        }

        // 5. Preparar y cargar metadatos de archivos (Radiografías)
        if (files && files.length > 0) {
            const filesData = files.map(file => {
                // Normalización de ruta (igual que en patient.controller.js)
                const cleanPath = file.path.replace(/^.*uploads[\\/]/, "uploads/");
                const normalizePath = cleanPath.replace(/\\/g, "/");

                return {
                    patient_extraction_id: newOrder.id,
                    filename: file.filename,
                    original_name: file.originalname,
                    path: normalizePath,
                    mimetype: file.mimetype,
                    size: file.size
                };
            });
            await extractionRepo.addFiles(filesData, transaction);
        }

        await transaction.commit();
        return await extractionRepo.getById(newOrder.id, user.tenant_id);

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// 🔍 Listar órdenes del paciente
const getPatientExtractions = async (patientId, user) => {
    // Verificamos acceso al paciente
    const patient = await getPatientById(patientId, user);
    if (!patient) throw new Error('Paciente no encontrado');

    return await extractionRepo.getAllByPatient(patientId, user.tenant_id);
};

// 🔍 Obtener detalle de orden
const getExtractionById = async (id, user) => {
    const order = await extractionRepo.getById(id, user.tenant_id);
    if (!order) return null;
    return order;
};

// ✏️ Actualizar orden
const updateExtractionOrder = async (data, user, newFiles) => {
    const transaction = await sequelize.transaction();
    try {
        const order = await extractionRepo.getById(data.id, user.tenant_id);
        if (!order) throw new Error('Orden no encontrada');

        // 1. Actualizar Header
        await extractionRepo.update(data.id, data.order, transaction);

        // 2. Refrescar Dientes (Borrar todos + Agregar nuevos)
        await extractionRepo.removeAllTeeth(data.id, transaction);

        if (data.teeth && data.teeth.length > 0) {
            const teethData = data.teeth.map(t => ({
                patient_extraction_id: data.id,
                tooth_id: t.tooth,
                extraction: t.extraction,
                areas: t.areas
            }));
            await extractionRepo.addTeeth(teethData, transaction);
        }

        // 3. Agregar nuevos archivos
        if (newFiles && newFiles.length > 0) {
            const filesData = newFiles.map(file => {
                const cleanPath = file.path.replace(/^.*uploads[\\/]/, "uploads/");
                const normalizePath = cleanPath.replace(/\\/g, "/");
                return {
                    patient_extraction_id: data.id,
                    filename: file.filename,
                    original_name: file.originalname, // FIXED prop name
                    path: normalizePath,
                    mimetype: file.mimetype,
                    size: file.size
                };
            });
            await extractionRepo.addFiles(filesData, transaction);
        }

        // Nota: El frontend debería enviar IDs de archivos a borrar si se requiere eliminación
        // Por ahora, solo agrega los nuevos.

        await transaction.commit();
        return await extractionRepo.getById(data.id, user.tenant_id);

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// 🔴 Eliminar orden
const deleteExtractionOrder = async (id, user) => {
    const order = await extractionRepo.getById(id, user.tenant_id);
    if (!order) throw new Error('Orden no encontrada o no tienes permisos.');

    // Eliminar archivos físicos
    if (order.files && order.files.length > 0) {
        order.files.forEach(file => {
            try {
                // file.path es relativo "uploads/..."
                const absolutePath = path.join(process.cwd(), file.path);
                if (fs.existsSync(absolutePath)) {
                    fs.unlinkSync(absolutePath);
                }
            } catch (err) {
                console.error(`Error deleting file:`, err);
            }
        });
    }

    return await extractionRepo.remove(id, user.tenant_id);
};

module.exports = {
    createExtractionOrder,
    getPatientExtractions,
    getExtractionById,
    updateExtractionOrder,
    deleteExtractionOrder
};

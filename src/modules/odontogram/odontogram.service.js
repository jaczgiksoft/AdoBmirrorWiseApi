// src/modules/odontogram/odontogram.service.js
const odontogramRepository = require('./odontogram.repository');
const sequelize = require('../../config/database');
const { logger } = require('../../utils/logger');

class OdontogramService {
    async getOdontogramByPatient(patientId, tenantId) {
        return odontogramRepository.findByPatient(patientId, tenantId);
    }

    async saveOdontogram(patientId, tenantId, data) {
        const transaction = await sequelize.transaction();
        try {
            let odontogram = await odontogramRepository.findByPatient(patientId, tenantId);

            const globalData = {
                bracketWires: data.bracketWires,
                tads: data.tads,
                tadWires: data.tadWires
            };

            if (odontogram) {
                // Actualizar cabecera
                await odontogramRepository.update(odontogram, { global_data: globalData }, transaction);
                // Limpiar detalles anteriores
                await odontogramRepository.deleteDetails(odontogram.id, transaction);
            } else {
                // Crear cabecera
                odontogram = await odontogramRepository.create({
                    patient_id: patientId,
                    tenant_id: tenantId,
                    global_data: globalData
                }, transaction);
            }

            // Preparar detalles por diente
            const details = [];
            
            // Consolidar todos los IDs de dientes que tienen algún dato
            const toothIds = new Set([
                ...Object.keys(data.toothStates || {}),
                ...Object.keys(data.brackets || {}),
                ...Object.keys(data.surfaceStates || {}),
                ...Object.keys(data.periodontalData || {}),
                ...Object.keys(data.toothNotes || {})
            ]);

            for (const toothId of toothIds) {
                const status = {
                    toothState: data.toothStates?.[toothId] || null,
                    brackets: data.brackets?.[toothId] || null,
                    periodontalData: data.periodontalData?.[toothId] || null,
                    toothNote: data.toothNotes?.[toothId] || null
                };

                const caras = data.surfaceStates?.[toothId] || null;

                // Solo guardar si hay algo relevante
                if (status.toothState || status.brackets || status.periodontalData || status.toothNote || caras) {
                    details.push({
                        odontogram_id: odontogram.id,
                        tooth_id: parseInt(toothId),
                        status,
                        caras
                    });
                }
            }

            if (details.length > 0) {
                await odontogramRepository.bulkCreateDetails(details, transaction);
            }

            await transaction.commit();
            return odontogramRepository.findByPatient(patientId, tenantId);
        } catch (error) {
            await transaction.rollback();
            logger.error(`[OdontogramService] Error al guardar odontograma: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new OdontogramService();

// src/modules/periodontogram/periodontogram.service.js
const periodontogramRepository = require('./periodontogram.repository');
const sequelize = require('../../config/database');
const { logger } = require('../../utils/logger');

class PeriodontogramService {
    async getLatestByPatient(patientId, tenantId) {
        return periodontogramRepository.findLatestByPatient(patientId, tenantId);
    }

    async getAllByPatient(patientId, tenantId) {
        return periodontogramRepository.findAllByPatient(patientId, tenantId);
    }

    async upsertPeriodontogram(data, tenantId) {
        const transaction = await sequelize.transaction();
        try {
            let record;
            if (data.id) {
                // Si viene un ID, actualizamos el registro existente (modo edición)
                record = await periodontogramRepository.findById(data.id, tenantId);
                if (!record) {
                    throw new Error('El registro de periodontograma no fue encontrado.');
                }
                
                await periodontogramRepository.update(record, {
                    teeth_data: data.teeth_data,
                    odontogram_states: data.odontogram_states,
                    exam_date: data.exam_date || record.exam_date,
                    notes: data.notes || null
                }, transaction);
            } else {
                // Nuevo registro
                record = await periodontogramRepository.create({
                    tenant_id: tenantId,
                    patient_id: data.patientId,
                    teeth_data: data.teeth_data,
                    odontogram_states: data.odontogram_states,
                    exam_date: data.exam_date || new Date(),
                    notes: data.notes || null
                }, transaction);
            }

            await transaction.commit();
            return record;
        } catch (error) {
            await transaction.rollback();
            logger.error(`[PeriodontogramService] Error upsert periodontogram: ${error.message}`);
            throw error;
        }
    }

    async deletePeriodontogram(id, tenantId) {
        const transaction = await sequelize.transaction();
        try {
            const record = await periodontogramRepository.findById(id, tenantId);
            if (!record) {
                throw new Error('Registro no encontrado.');
            }
            
            await periodontogramRepository.delete(id, tenantId, transaction);
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new PeriodontogramService();

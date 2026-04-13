// src/modules/odontogram/odontogram.repository.js
const Odontogram = require('../../models/mysql/odontogram.model');
const OdontogramDetalle = require('../../models/mysql/odontogram_detalle.model');

class OdontogramRepository {
    async findByPatient(patientId, tenantId) {
        return Odontogram.findOne({
            where: { patient_id: patientId, tenant_id: tenantId },
            include: [{
                model: OdontogramDetalle,
                as: 'details'
            }]
        });
    }

    async create(data, transaction) {
        return Odontogram.create(data, { transaction });
    }

    async update(odontogram, data, transaction) {
        return odontogram.update(data, { transaction });
    }

    async deleteDetails(odontogramId, transaction) {
        return OdontogramDetalle.destroy({
            where: { odontogram_id: odontogramId },
            transaction
        });
    }

    async bulkCreateDetails(details, transaction) {
        return OdontogramDetalle.bulkCreate(details, { transaction });
    }
}

module.exports = new OdontogramRepository();

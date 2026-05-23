const PatientMovil = require('../../models/mysql/patient_movil.model');

/**
 * Register a new push token for a patient or update existing
 * We might just insert it, or check if it exists so we don't have duplicates.
 */
const registerToken = async (tenant_id, patient_id, token) => {
    // Check if token already exists for this patient
    const existing = await PatientMovil.findOne({
        where: { tenant_id, patient_id, token }
    });

    if (existing) {
        // Token is already registered, just return it or update its timestamp
        existing.changed('updated_at', true);
        await existing.save();
        return existing;
    }

    // Optionally check if token is registered to another user and delete it or move it
    // For now we'll just create a new record
    const newRecord = await PatientMovil.create({
        tenant_id,
        patient_id,
        token
    });

    return newRecord;
};

/**
 * Remove a push token
 */
const removeToken = async (tenant_id, patient_id, token) => {
    await PatientMovil.destroy({
        where: { tenant_id, patient_id, token }
    });
};

module.exports = {
    registerToken,
    removeToken
};

const PatientAlert = require('../../models/mysql/patient_alert.model');
const Patient = require('../../models/mysql/patient.model');
const Tenant = require('../../models/mysql/tenant.model');

class PatientAlertRepository {
    // 🟢 Crear alerta
    async createAlert(data, transaction) {
        return PatientAlert.create(data, { transaction });
    }

    // 🟡 Actualizar alerta
    async updateAlert(alert, data, transaction) {
        return alert.update(data, { transaction });
    }

    // 🔴 Eliminar alerta (borrado físico)
    async deleteAlert(alert, transaction) {
        return alert.destroy({ transaction, force: true }); // borrado definitivo
    }

    // 🔍 Buscar alerta por ID (según tenant)
    async findById(id, tenantId) {
        return PatientAlert.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name'] },
            ],
        });
    }

    // 📋 Obtener todas las alertas de un paciente
    async findByPatientId(patientId, tenantId) {
        return PatientAlert.findAll({
            where: { patient_id: patientId, tenant_id: tenantId },
            include: [
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name'] },
            ],
            order: [['createdAt', 'DESC']],
        });
    }
}

module.exports = new PatientAlertRepository();

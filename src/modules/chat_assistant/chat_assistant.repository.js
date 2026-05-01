const { Op } = require('sequelize');

// Models
const Patient = require('../../models/mysql/patient.model');
const PatientClinicalRecord = require('../../models/mysql/patient_clinical_record.model');
const PatientAlert = require('../../models/mysql/patient_alert.model');

const Appointment = require('../../models/mysql/appointment.model');
const Odontogram = require('../../models/mysql/odontogram.model');
const OdontogramDetalle = require('../../models/mysql/odontogram_detalle.model');

const TreatmentPlan = require('../../models/mysql/treatment_plan.model');
const TreatmentPlanItem = require('../../models/mysql/treatment_plan_item.model');

const Service = require('../../models/mysql/service.model');
const Employee = require('../../models/mysql/employee.model');
const ClinicArea = require('../../models/mysql/clinic_area.model');

const InventoryItem = require('../../models/mysql/inventory_item.model');
const InventoryMovement = require('../../models/mysql/inventory_movement.model');

class ChatAssistantRepository {

    // ==========================================
    // 🏥 PATIENTS
    // ==========================================
    async searchPatientsByName(tenant_id, nameQuery) {
        return await Patient.findAll({
            where: {
                tenant_id,
                [Op.or]: [
                    { first_name: { [Op.like]: `%${nameQuery}%` } },
                    { last_name: { [Op.like]: `%${nameQuery}%` } }
                ]
            },
            limit: 10,
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'doc_number']
        });
    }

    async getPatientClinicalRecord(tenant_id, patient_id) {
        return await PatientClinicalRecord.findOne({
            where: { tenant_id, patient_id },
            raw: true
        });
    }

    async getPatientAlerts(tenant_id, patient_id) {
        return await PatientAlert.findAll({
            where: { tenant_id, patient_id },
            raw: true
        });
    }

    // ==========================================
    // 📅 APPOINTMENTS & ODONTOGRAM
    // ==========================================
    async getUpcomingAppointments(tenant_id, limit = 10) {
        return await Appointment.findAll({
            where: { 
                tenant_id,
                date: { [Op.gte]: new Date() }
            },
            order: [['date', 'ASC'], ['start_time', 'ASC']],
            limit,
            raw: true
        });
    }

    async getPatientOdontograms(tenant_id, patient_id) {
        return await Odontogram.findAll({
            where: { tenant_id, patient_id },
            raw: true
        });
    }

    async getOdontogramDetails(tenant_id, odontogram_id) {
        return await OdontogramDetalle.findAll({
            where: { tenant_id, odontogram_id },
            raw: true
        });
    }

    // ==========================================
    // 📋 TREATMENTS
    // ==========================================
    async getPatientTreatmentPlans(tenant_id, patient_id) {
        return await TreatmentPlan.findAll({
            where: { tenant_id, patient_id },
            raw: true
        });
    }

    async getTreatmentPlanItems(tenant_id, plan_id) {
        return await TreatmentPlanItem.findAll({
            where: { tenant_id, plan_id },
            raw: true
        });
    }

    // ==========================================
    // ⚙️ OPERATIONAL (SERVICES & EMPLOYEES)
    // ==========================================
    async getAvailableServices(tenant_id) {
        return await Service.findAll({
            where: { tenant_id, status: 1 },
            attributes: ['id', 'name', 'price', 'duration'],
            raw: true
        });
    }

    async getEmployees(tenant_id) {
        return await Employee.findAll({
            where: { tenant_id, status: 1 },
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
            raw: true
        });
    }

    async getClinicAreas(tenant_id) {
        return await ClinicArea.findAll({
            where: { tenant_id, status: 1 },
            raw: true
        });
    }

    // ==========================================
    // 📦 INVENTORY
    // ==========================================
    async getInventoryStock(tenant_id, search = '') {
        const whereClause = { tenant_id, status: 1 };
        if (search) {
            whereClause.name = { [Op.like]: `%${search}%` };
        }
        return await InventoryItem.findAll({
            where: whereClause,
            attributes: ['id', 'name', 'sku', 'stock', 'min_stock'],
            raw: true
        });
    }

    async getInventoryMovements(tenant_id, item_id, limit = 10) {
        return await InventoryMovement.findAll({
            where: { tenant_id, item_id },
            order: [['created_at', 'DESC']],
            limit,
            raw: true
        });
    }
}

module.exports = new ChatAssistantRepository();

const { Op } = require('sequelize');
const Patient = require('../../models/mysql/patient.model');
const Tenant = require('../../models/mysql/tenant.model');
const Referral = require('../../models/mysql/referral.model');
const Occupation = require('../../models/mysql/occupation.model');
const PatientType = require('../../models/mysql/patient_type.model');
const PatientStatus = require('../../models/mysql/patient_status.model');
const BracketType = require('../../models/mysql/bracket_type.model');
const PatientProfession = require('../../models/mysql/patient_profession.model');

class PatientRepository {
    // 📋 Obtener todos los pacientes de un tenant
    async findAllByTenant(tenantId) {
        return Patient.findAll({
            where: { tenant_id: tenantId },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
                { model: Referral, as: 'referral', attributes: ['id', 'name'] },
                { model: Occupation, as: 'occupation', attributes: ['id', 'name'] },
                // 🔁 Cambiado a relación N:M
                { model: PatientType, as: 'types', through: { attributes: [] }, attributes: ['id', 'name', 'color'] },
                { model: PatientStatus, as: 'status', attributes: ['id', 'name', 'color'] },
                { model: BracketType, as: 'bracket_type', attributes: ['id', 'name', 'color'] },
                { model: PatientProfession, as: 'profession', attributes: ['id', 'name', 'abbreviation'] }
            ],
            order: [['last_name', 'ASC']]
        });
    }

    // 🔍 Buscar paciente por ID y tenant
    async findById(id, tenantId) {
        return Patient.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
                { model: Referral, as: 'referral', attributes: ['id', 'name'] },
                { model: Occupation, as: 'occupation', attributes: ['id', 'name'] },
                // 🔁 Cambiado a N:M
                { model: PatientType, as: 'types', through: { attributes: [] }, attributes: ['id', 'name', 'color'] },
                { model: PatientStatus, as: 'status', attributes: ['id', 'name'] },
                { model: BracketType, as: 'bracket_type', attributes: ['id', 'name'] },
                { model: PatientProfession, as: 'profession', attributes: ['id', 'name', 'abbreviation'] }
            ]
        });
    }

    // 🟢 Crear paciente
    async createPatient(data, transaction) {
        return Patient.create(data, { transaction });
    }

    // 🟡 Actualizar paciente
    async updatePatient(patient, data, transaction) {
        return patient.update(data, { transaction });
    }

    // 🔴 Eliminación lógica (soft delete)
    async softDeletePatient(patient, transaction) {
        await patient.destroy({ transaction }); // Sequelize usa paranoid
    }

    // 📊 Datatable / Listado con búsqueda y paginación
    async datatable(params) {
        const { start, length, searchValue, orderColumn, orderDir, tenant_id } = params;

        const where = { tenant_id };

        if (searchValue && searchValue.trim() !== '') {
            where[Op.or] = [
                { first_name: { [Op.like]: `%${searchValue}%` } },
                { last_name: { [Op.like]: `%${searchValue}%` } },
                { medical_record_number: { [Op.like]: `%${searchValue}%` } },
                { phone_number: { [Op.like]: `%${searchValue}%` } },
                { email: { [Op.like]: `%${searchValue}%` } }
            ];
        }

        const recordsTotal = await Patient.count({ where: { tenant_id } });

        const { rows, count: recordsFiltered } = await Patient.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: [[orderColumn, orderDir]],
            include: [
                { model: PatientStatus, as: 'status', attributes: ['id', 'name', 'color'] },
                // 🔁 Cambiado a relación N:M
                { model: PatientType, as: 'types', through: { attributes: [] }, attributes: ['id', 'name', 'color'] }
            ]
        });

        return { recordsTotal, recordsFiltered, rows };
    }

    // ⚙️ Obtener perfil completo del paciente
    async getFullProfile(id, tenantId) {
        return Patient.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
                { model: Referral, as: 'referral', attributes: ['id', 'name'] },
                { model: Occupation, as: 'occupation', attributes: ['id', 'name'] },
                // 🔁 Cambiado a N:M
                { model: PatientType, as: 'types', through: { attributes: [] }, attributes: ['id', 'name', 'color'] },
                { model: PatientStatus, as: 'status', attributes: ['id', 'name', 'color', 'order_index'] },
                { model: BracketType, as: 'bracket_type', attributes: ['id', 'name', 'material', 'color'] },
                { model: PatientProfession, as: 'profession', attributes: ['id', 'name', 'abbreviation'] }
            ]
        });
    }

    // 🆔 Obtener el último número de expediente del tenant
    async getLastMedicalRecord(tenantId) {
        return Patient.findOne({
            where: { tenant_id: tenantId },
            order: [['medical_record_number', 'DESC']],
            attributes: ['medical_record_number']
        });
    }

}

module.exports = new PatientRepository();

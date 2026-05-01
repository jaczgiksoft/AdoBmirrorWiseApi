const { Op } = require('sequelize');
const Patient = require('../../models/mysql/patient.model');
const Tenant = require('../../models/mysql/tenant.model');
const Referral = require('../../models/mysql/referral.model');
const Occupation = require('../../models/mysql/occupation.model');
const PatientType = require('../../models/mysql/patient_type.model');
const PatientStatus = require('../../models/mysql/patient_status.model');
const BracketType = require('../../models/mysql/bracket_type.model');
const PatientProfession = require('../../models/mysql/patient_profession.model');
const BillingData = require('../../models/mysql/billing_data.model');
const PatientBillingData = require('../../models/mysql/patient_billing_data.model');
const PatientRepresentative = require('../../models/mysql/patient_representative.model');
const PatientRepresentativeLink = require('../../models/mysql/patient_representative_link.model');
const PatientAlert = require('../../models/mysql/patient_alert.model');
const PatientPatientType = require('../../models/mysql/patient_patient_type.model');
const PatientHobby = require('../../models/mysql/patient_hobby.model');

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

    // 🔍 Buscar paciente por username de login
    async findByUsername(username) {
        return Patient.findOne({
            where: { username },
            include: [
                { model: Tenant, as: 'tenant', attributes: ['id', 'name', 'code'] },
                { model: PatientStatus, as: 'status', attributes: ['id', 'name'] }
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
                { middle_name: { [Op.like]: `%${searchValue}%` } },
                { medical_record_number: { [Op.like]: `%${searchValue}%` } },
                { phone_number: { [Op.like]: `%${searchValue}%` } },
                { email: { [Op.like]: `%${searchValue}%` } }
            ];
        }

        const recordsTotal = await Patient.count({ where: { tenant_id } });

        // 🧠 Lógica híbrida:
        // Si el front NO envía un orderColumn válido → usar "id DESC"
        const defaultOrder = [["id", "DESC"]];

        const finalOrder = orderColumn
            ? [[orderColumn, orderDir || "ASC"]]
            : defaultOrder;

        const { rows, count: recordsFiltered } = await Patient.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: finalOrder,
            include: [
                { model: PatientStatus, as: 'status', attributes: ['id', 'name', 'color'] },
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
                // 🟦 Tenant
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },

                // 🟩 Catálogos principales
                { model: Referral, as: 'referral', attributes: ['id', 'name'] },
                { model: Occupation, as: 'occupation', attributes: ['id', 'name'] },
                { model: PatientStatus, as: 'status', attributes: ['id', 'name', 'color', 'order_index'] },
                { model: BracketType, as: 'bracket_type', attributes: ['id', 'name', 'material', 'color'] },
                { model: PatientProfession, as: 'profession', attributes: ['id', 'name', 'abbreviation'] },

                // 🔁 Tipos de paciente (N:M)
                {
                    model: PatientType,
                    as: 'types',
                    through: { attributes: [] },
                    attributes: ['id', 'name', 'color']
                },

                // 📢 Alertas del paciente
                {
                    model: PatientAlert,
                    as: 'alerts',
                    attributes: ['id', 'title', 'description', 'is_admin_alert', 'createdAt']
                },

                // 🎯 Hobbies
                {
                    model: PatientHobby,
                    as: 'hobbies',
                    attributes: ['id', 'name']
                },

                // 👨‍👩‍👧 REPRESENTANTES (N:M)
                {
                    model: PatientRepresentative,
                    as: 'representatives',
                    attributes: [
                        'id',
                        'full_name',
                        'relationship',
                        'phone',
                        'phone_alt',
                        'email',
                        'address',
                        'can_login',
                        'first_login'
                    ]
                },

                // 🧾 DATOS DE FACTURACIÓN (N:M)
                {
                    model: BillingData,
                    as: 'billing_data',
                    attributes: [
                        'id',
                        'business_name',
                        'rfc',
                        'tax_regime',
                        'zip_code',
                        'email',
                        'is_active'
                    ]
                }
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

    async addBillingData(patientId, billingList, tenantId, transaction) {
        for (const item of billingList) {
            const created = await BillingData.create(
                {
                    tenant_id: tenantId,
                    business_name: item.business_name,
                    rfc: item.rfc,
                    tax_regime: item.tax_regime,
                    zip_code: item.zip_code,
                    email: item.email
                },
                { transaction }
            );

            await PatientBillingData.create(
                {
                    tenant_id: tenantId,
                    patient_id: patientId,
                    billing_data_id: created.id,
                    is_primary: item.is_primary
                },
                { transaction }
            );
        }
    }

    async addRepresentatives(patientId, reps, tenantId, transaction) {
        for (const rep of reps) {
            const created = await PatientRepresentative.create(
                {
                    tenant_id: tenantId,
                    full_name: rep.full_name,
                    relationship: rep.relationship,
                    phone: rep.phone,
                    email: rep.email,
                    can_login: rep.can_login,
                    username: rep.username,
                    password: rep.password
                },
                { transaction }
            );

            await PatientRepresentativeLink.create(
                {
                    tenant_id: tenantId,
                    representative_id: created.id,
                    patient_id: patientId,
                    is_primary: rep.is_primary
                },
                { transaction }
            );
        }
    }

    async addAlerts(patientId, alerts, tenantId, transaction) {
        for (const alert of alerts) {
            await PatientAlert.create(
                {
                    tenant_id: tenantId,
                    patient_id: patientId,
                    title: alert.title,
                    description: alert.description,
                    is_admin_alert: alert.is_admin_alert
                },
                { transaction }
            );
        }
    }

    async setPatientTypes(patient_id, type_ids, tenant_id, transaction) {
        // Borrar asignaciones anteriores
        await PatientPatientType.destroy({
            where: { patient_id },
            transaction
        });

        // Insertar nuevas asignaciones
        for (const typeId of type_ids) {
            await PatientPatientType.create({
                patient_id,
                patient_type_id: typeId,
                tenant_id
            }, { transaction });
        }
    }

}

module.exports = new PatientRepository();

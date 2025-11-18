// src/modules/patient/patient.service.js
const sequelize = require('../../config/database');
const patientRepository = require('./patient.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');
const Patient = require('../../models/mysql/patient.model'); // 👈 necesario para setTypes()

class PatientService {
    // 📋 Obtener todos los pacientes por tenant
    async getAllPatients(currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No se encontró tenant en el token');
        }

        return await patientRepository.findAllByTenant(currentUser.tenant_id);
    }

    // 🔍 Obtener un paciente por ID
    async getPatientById(id, currentUser) {
        const patient = await patientRepository.findById(id, currentUser.tenant_id);
        if (!patient) throw new Error('Paciente no encontrado');
        return patient;
    }

    // 🟢 Crear nuevo paciente
    async createPatient(data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            // 🔹 Campos permitidos
            const allowedFields = [
                'tenant_id', 'medical_record_number', 'family_code',
                'first_name', 'last_name', 'middle_name', 'nickname',
                'genre', 'birth_date', 'marital_status',
                'phone_number', 'email',
                'referral_id', 'occupation_id', 'bracket_type_id',
                'patient_status_id', 'patient_profession_id',
                'address_street_name', 'address_neighborhood',
                'address_apartment_number', 'address_street_number',
                'address_zip_code', 'address_city', 'address_state', 'address_country',
                'rfc', 'company', 'company_address',
                'photo_url', 'medical_record_image_url',
                'is_under_medical_treatment', 'current_treatment_description',
                'is_taking_medication', 'current_medications',
                'is_allergic_to_medication', 'allergies_description',
                'has_hepatitis', 'has_diabetes', 'has_lung_conditions',
                'has_migraines', 'has_amigdalitis', 'has_adenoiditis',
                'has_epilepsy', 'has_rheumatic_fever', 'has_psychological_conditions',
                'has_heart_conditions', 'has_hemophilia', 'has_stds',
                'is_pregnant', 'pregnancy_weeks',
                'last_radiograph_date', 'last_dental_exam_date',
                'has_received_fluoride', 'fluoride_date_description',
                'has_bleeding_gums', 'has_oral_habits', 'chews_on_both_sides',
                'has_jaw_pain_or_noise', 'grinds_teeth', 'breathes_through_mouth',
                'had_previous_orthodontics', 'username', 'password',
                'can_login', 'push_token', 'first_login'
            ];

            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            cleanData.tenant_id = currentUser.tenant_id;

            // Crear paciente base
            const newPatient = await patientRepository.createPatient(cleanData, t);

            // 🔁 Asociar múltiples tipos si se envían
            if (Array.isArray(data.patient_type_ids) && data.patient_type_ids.length > 0) {
                await newPatient.setTypes(data.patient_type_ids, { transaction: t });
            }

            await t.commit();

            // 🔄 Recargar paciente con sus tipos asociados
            const patientWithTypes = await patientRepository.findById(newPatient.id, currentUser.tenant_id);

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'patients',
                description: `Paciente creado: ${newPatient.first_name} ${newPatient.last_name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            await notifyUser({
                user_id: currentUser.id,
                title: 'Nuevo paciente creado',
                message: `${currentUser.username} registró al paciente ${newPatient.first_name} ${newPatient.last_name}.`,
                type: 'info'
            });

            return patientWithTypes;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear paciente: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar paciente
    async updatePatient(id, data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const patient = await patientRepository.findById(id, currentUser.tenant_id);
            if (!patient) throw new Error('Paciente no encontrado');

            const allowedFields = [
                'family_code', 'first_name', 'last_name', 'middle_name', 'nickname',
                'genre', 'birth_date', 'marital_status',
                'phone_number', 'email',
                'referral_id', 'occupation_id', 'bracket_type_id',
                'patient_status_id', 'patient_profession_id',
                'address_street_name', 'address_neighborhood',
                'address_apartment_number', 'address_street_number',
                'address_zip_code', 'address_city', 'address_state', 'address_country',
                'rfc', 'company', 'company_address',
                'photo_url', 'medical_record_image_url',
                'is_under_medical_treatment', 'current_treatment_description',
                'is_taking_medication', 'current_medications',
                'is_allergic_to_medication', 'allergies_description',
                'has_hepatitis', 'has_diabetes', 'has_lung_conditions',
                'has_migraines', 'has_amigdalitis', 'has_adenoiditis',
                'has_epilepsy', 'has_rheumatic_fever', 'has_psychological_conditions',
                'has_heart_conditions', 'has_hemophilia', 'has_stds',
                'is_pregnant', 'pregnancy_weeks',
                'last_radiograph_date', 'last_dental_exam_date',
                'has_received_fluoride', 'fluoride_date_description',
                'has_bleeding_gums', 'has_oral_habits', 'chews_on_both_sides',
                'has_jaw_pain_or_noise', 'grinds_teeth', 'breathes_through_mouth',
                'had_previous_orthodontics', 'username', 'password',
                'can_login', 'push_token', 'first_login'
            ];

            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            await patientRepository.updatePatient(patient, cleanData, t);

            // 🔁 Actualizar tipos asociados si se envían
            if (Array.isArray(data.patient_type_ids)) {
                await patient.setTypes(data.patient_type_ids, { transaction: t });
            }

            await t.commit();

            // 🔄 Recargar paciente actualizado con sus tipos
            const updatedPatient = await patientRepository.findById(patient.id, currentUser.tenant_id);

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'patients',
                description: `Paciente actualizado: ${patient.first_name} ${patient.last_name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return updatedPatient;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar paciente: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar (soft delete)
    async deletePatient(id, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const t = await sequelize.transaction();
        try {
            const patient = await patientRepository.findById(id, currentUser.tenant_id);
            if (!patient) throw new Error('Paciente no encontrado');

            await patientRepository.softDeletePatient(patient, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'patients',
                description: `Paciente eliminado: ${patient.first_name} ${patient.last_name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            await notifyUser({
                user_id: currentUser.id,
                title: 'Paciente eliminado',
                message: `${currentUser.username} ha eliminado al paciente ${patient.first_name} ${patient.last_name}.`,
                type: 'warning'
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar paciente: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 📊 DataTable (para listado filtrado/paginado)
    async getPatientsDatatable(body, currentUser) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;
        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'first_name', 'last_name', 'medical_record_number', 'birth_date'];
        const orderColumn = columns[orderColumnIndex] || 'id';

        const params = { start, length, searchValue, orderColumn, orderDir, tenant_id: currentUser.tenant_id };

        const { recordsTotal, recordsFiltered, rows } = await patientRepository.datatable(params);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }

    // ⚙️ Obtener expediente completo del paciente
    async getPatientProfile(id, currentUser) {
        const patient = await patientRepository.getFullProfile(id, currentUser.tenant_id);
        if (!patient) throw new Error('Perfil no encontrado');
        return patient;
    }
}

module.exports = new PatientService();

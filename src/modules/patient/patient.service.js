// src/modules/patient/patient.service.js
const sequelize = require('../../config/database');
const patientRepository = require('./patient.repository');
const appointmentRepository = require('../appointment/appointment.repository');
const patientAlertRepository = require('../patient_alert/patient_alert.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');
const { notifyUser } = require('../../utils/notify.helper');
const Patient = require('../../models/mysql/patient.model'); // 👈 necesario para setTypes()
const { Op } = require('sequelize');

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
            const tenantId = currentUser.tenant_id;

            // --- LIMPIAR Y PREPARAR PAYLOAD ---
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
                'photo_url', 'username', 'password', 'can_login', 'first_login'
            ];

            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            // ------------------------------
            // 🔥 GENERAR ACCESO AUTOMÁTICO
            // ------------------------------
            cleanData.can_login = true;
            cleanData.username = cleanData.phone_number;
            cleanData.password = cleanData.phone_number;
            cleanData.first_login = true; // fuerza cambio de contraseña

            cleanData.tenant_id = tenantId;
            // Convertir IDs numéricos
            if (cleanData.referral_id) cleanData.referral_id = parseInt(cleanData.referral_id);
            if (cleanData.occupation_id) cleanData.occupation_id = parseInt(cleanData.occupation_id);
            if (cleanData.bracket_type_id) cleanData.bracket_type_id = parseInt(cleanData.bracket_type_id);
            if (cleanData.patient_status_id) cleanData.patient_status_id = parseInt(cleanData.patient_status_id);
            if (cleanData.patient_profession_id) cleanData.patient_profession_id = parseInt(cleanData.patient_profession_id);

            // 📌 Crear paciente base
            const newPatient = await patientRepository.createPatient(cleanData, t);

            // 📌 Tipos N:M
            if (Array.isArray(data.patient_type_ids) && data.patient_type_ids.length > 0) {
                if (Array.isArray(data.patient_type_ids) && data.patient_type_ids.length > 0) {
                    console.log("tipos", data.patient_type_ids, `newPatient: ${newPatient}, tenantId: ${tenantId}`);
                    await patientRepository.setPatientTypes(
                        newPatient.id,
                        data.patient_type_ids,
                        tenantId,
                        t
                    );
                }
            }

            // 📌 Datos fiscales
            if (Array.isArray(data.billing_data) && data.billing_data.length > 0) {
                await patientRepository.addBillingData(
                    newPatient.id,
                    data.billing_data,
                    tenantId,
                    t
                );
            }

            // 📌 Representantes
            if (Array.isArray(data.legal_representatives) && data.legal_representatives.length > 0) {
                await patientRepository.addRepresentatives(
                    newPatient.id,
                    data.legal_representatives,
                    tenantId,
                    t
                );
            }

            // 📌 Alertas
            if (Array.isArray(data.alerts) && data.alerts.length > 0) {
                await patientRepository.addAlerts(
                    newPatient.id,
                    data.alerts,
                    tenantId,
                    t
                );
            }

            await t.commit();

            const result = await patientRepository.findById(newPatient.id, tenantId);

            // 🔔 Notificaciones, logs
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'patients',
                description: `Paciente creado: ${newPatient.first_name} ${newPatient.last_name}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return result;

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
        const searchValue = body.searchValue || body['search[value]'] || (body.search?.value ?? '');
        const orderColumnValue = body.orderColumn || body['order[0][column]'] || body.order?.[0]?.column;
        const orderDir = (body.orderDir || body['order[0][dir]'] || body.order?.[0]?.dir || 'asc').toUpperCase();

        const columns = [null, 'first_name', 'last_name', 'medical_record_number', 'birth_date'];
        const orderColumn = (typeof orderColumnValue === 'string' && orderColumnValue) 
            ? orderColumnValue 
            : (columns[parseInt(orderColumnValue)] || 'first_name');

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

    // 🧩 Generar siguiente número de expediente
    async getNextMedicalRecord(currentUser) {
        const tenantId = currentUser.tenant_id;

        // Obtener tenant (necesitamos el code)
        const tenant = await require('../../models/mysql/tenant.model')
            .findByPk(tenantId);

        if (!tenant || !tenant.code) {
            throw new Error("El tenant no tiene code definido");
        }

        // Tomamos los últimos 4 dígitos del code
        const prefix = tenant.code.slice(-4);

        // Último expediente del tenant
        const last = await patientRepository.getLastMedicalRecord(tenantId);

        if (!last || !last.medical_record_number) {
            return `${prefix}0001`;
        }

        const lastNumber = parseInt(last.medical_record_number.slice(-4), 10);
        const nextNumber = String(lastNumber + 1).padStart(4, '0');

        return `${prefix}${nextNumber}`;
    }

    // 🏠 Obtener resumen para el Home (Móvil)
    async getPatientHomeSummary(patientId, currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No se encontró tenant en el token');
        }

        const tenantId = currentUser.tenant_id;

        // 1. Datos básicos del paciente
        const patient = await patientRepository.findById(patientId, tenantId);
        if (!patient) throw new Error('Paciente no encontrado');

        // 2. Próxima cita (futura y pendiente)
        const today = new Date().toISOString().split('T')[0];
        const appointments = await appointmentRepository.findAllWithFilters(tenantId, {
            patient_id: patientId,
            date_from: today,
            status: 'pendiente' // Asegurarse que coincida con el ENUM del modelo (en appointment.repository vi 'pendiente')
        });

        // Ordenar por fecha y hora para obtener la más cercana
        const sortedAppointments = appointments.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.start_time || '00:00:00'}`);
            const dateB = new Date(`${b.date}T${b.start_time || '00:00:00'}`);
            return dateA - dateB;
        });

        const nextAppt = sortedAppointments[0] || null;

        // 3. Conteo de alertas activas
        // En patient_alert.repository hay findByPatientId
        const alerts = await patientAlertRepository.findByPatientId(patientId, tenantId);
        const activeAlertsCount = alerts.length;

        // 4. Armar respuesta
        // Combinamos fecha y hora en formato ISO si existe cita
        let nextAppointmentDate = null;
        let nextAppointmentReason = null;

        if (nextAppt) {
            // Unir fecha y hora para toLocaleDateString en el front
            // appt.date suele ser YYYY-MM-DD y appt.start_time HH:mm:ss
            nextAppointmentDate = new Date(`${nextAppt.date}T${nextAppt.start_time || '00:00:00'}`).toISOString();
            
            // Buscar motivo (ej. primer servicio o notas)
            nextAppointmentReason = nextAppt.services?.[0]?.name || nextAppt.notes || 'Consulta General';
        }

        return {
            patientId,
            patientFirstName: patient.first_name,
            nextAppointmentDate,
            nextAppointmentReason,
            activeAlertsCount,
            treatmentStatus: 'En curso', // Mock
            treatmentProgress: 65        // Mock
        };
    }

    async getReferralStats(currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No se encontró tenant en el token');
        }

        const { stats, recentPatients } = await patientRepository.getReferralStats(currentUser.tenant_id);

        // 1. Procesar estadísticas para gráficas
        const formattedStats = stats.map(s => ({
            id: s.referral_id,
            name: s.referral ? s.referral.name : 'Desconocido',
            count: parseInt(s.get('count')) || 0
        }));

        // 2. Identificar mayor y menor impacto
        let highest = null;
        let lowest = null;
        if (formattedStats.length > 0) {
            highest = formattedStats[0]; // El repo ya los ordena DESC por count
            lowest = formattedStats[formattedStats.length - 1];
        }

        // 3. Obtener el histórico de las últimas 5 referencias únicas (sin repetir)
        const uniqueRecent = [];
        const seenIds = new Set();

        for (const p of recentPatients) {
            if (p.referral && !seenIds.has(p.referral.id)) {
                uniqueRecent.push({
                    id: p.referral.id,
                    name: p.referral.name,
                    patient_id: p.id,
                    date: p.createdAt
                });
                seenIds.add(p.referral.id);
            }
            if (uniqueRecent.length === 5) break;
        }

        return {
            stats: formattedStats,
            summary: {
                highest,
                lowest
            },
            recent: uniqueRecent
        };
    }

}

module.exports = new PatientService();

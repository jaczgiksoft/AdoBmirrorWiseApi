const { Op } = require('sequelize');
const Appointment = require('../../models/mysql/appointment.model');
const AppointmentService = require('../../models/mysql/appointment_service.model');
const Patient = require('../../models/mysql/patient.model');
const Employee = require('../../models/mysql/employee.model');
const ClinicArea = require('../../models/mysql/clinic_area.model');
const Service = require('../../models/mysql/service.model');
const AppointmentProcess = require('../../models/mysql/appointment_process.model');
const AppointmentProcessStep = require('../../models/mysql/appointment_process_step.model');
const PatientRepresentative = require('../../models/mysql/patient_representative.model');
const PatientRepresentativeLink = require('../../models/mysql/patient_representative_link.model');

class AppointmentRepository {
    // 🟢 Crear cita
    async createAppointment(data, transaction) {
        return Appointment.create(data, { transaction });
    }

    // 🟢 Crear servicios de la cita (Pivot)
    async addServices(servicesData, transaction) {
        return AppointmentService.bulkCreate(servicesData, { transaction });
    }

    // 🟡 Actualizar cita
    async updateAppointment(appointment, data, transaction) {
        return appointment.update(data, { transaction });
    }

    // 🟡 Limpiar servicios de una cita
    async removeServices(appointmentId, transaction) {
        return AppointmentService.destroy({
            where: { appointment_id: appointmentId },
            transaction
        });
    }

    // 🔴 Eliminar cita (soft delete)
    async deleteAppointment(appointment, transaction) {
        return appointment.destroy({ transaction });
    }

    // 🔍 Buscar cita por ID (según tenant)
    async findById(id, tenantId) {
        return Appointment.findOne({
            where: { id, tenant_id: tenantId },
            include: [
                { model: AppointmentService, as: 'services' },
                { model: Patient, as: 'patient' },
                { model: Employee, as: 'employee' },
                { model: ClinicArea, as: 'clinic_area' },
                {
                    model: AppointmentProcess,
                    as: 'process_snapshot',
                    include: [{ model: AppointmentProcessStep, as: 'steps' }]
                }
            ]
        });
    }

    // 📋 Obtener todas las citas con filtros
    async findAllWithFilters(tenantId, filters = {}) {
        const where = { tenant_id: tenantId };

        // 1. Filtro por Paciente
        if (filters.patient_id) {
            where.patient_id = filters.patient_id;
        }

        // 2. Filtro por Rango de Fechas
        if (filters.date_from && filters.date_to) {
            where.date = { [Op.between]: [filters.date_from, filters.date_to] };
        } else if (filters.date_from) {
            where.date = { [Op.gte]: filters.date_from };
        } else if (filters.date_to) {
            where.date = { [Op.lte]: filters.date_to };
        }

        // 3. Filtro por Estado
        if (filters.status && filters.status !== 'all') {
            where.status = filters.status;
        }

        // 4. Filtro por Hora Exacta
        if (filters.start_time) {
            where.start_time = filters.start_time;
        }

        // 5. Filtro por Rango de Hora
        if (filters.start_time_from && filters.start_time_to) {
            where.start_time = { [Op.between]: [filters.start_time_from, filters.start_time_to] };
        }

        // 6. Filtro por Area Clinica
        if (filters.clinic_area_id) {
            where.clinic_area_id = filters.clinic_area_id;
        }

        // Configuración de Include para Servicios
        const serviceInclude = {
            model: AppointmentService,
            as: 'services',
            include: [
                { model: Service, as: 'service', attributes: ['id', 'name', 'color', 'price', 'duration_minutes'] }
            ]
        };

        // 7. Filtro por Servicios (Service Ids)
        // Si se solicitan servicios, debemos asegurar que la cita tenga AL MENOS UNO de esos servicios.
        if (filters.service_ids && filters.service_ids.length > 0) {
            const serviceIds = Array.isArray(filters.service_ids)
                ? filters.service_ids
                : filters.service_ids.split(',').map(id => id.trim());

            serviceInclude.required = true; // Solo traer citas que cumplan el filtro
            serviceInclude.where = {
                service_id: { [Op.in]: serviceIds }
            };
        }

        const appointments = await Appointment.findAll({
            where,
            order: [['date', 'DESC'], ['start_time', 'ASC']],
            include: [
                { model: Patient, as: 'patient' },
                { model: Employee, as: 'employee' },
                { model: ClinicArea, as: 'clinic_area' },
                serviceInclude, // Include dinámico
                {
                    model: AppointmentProcess,
                    as: 'process_snapshot',
                    include: [{ model: AppointmentProcessStep, as: 'steps' }]
                }
            ]
        });

        // Recuperar TODOS los servicios de las citas encontradas
        // El filtro anterior (required=true) hace que SOLO vengan los servicios coincidentes en el array 'services'.
        // Si queremos mostrar TODOS los servicios de la cita, aunque filtremos por uno, necesitaríamos un enfoque diferente
        // (e.g. subquery WHERE id IN (SELECT appointment_id FROM ...)).
        // POR AHORA: Asumiremos que si filtras por servicio, te interesa ver la cita.
        // Si el requisito es "ver la cita completa con todos sus servicios", haríamos una segunda consulta o un where literales.
        // Para simplificar y rendimiento, dejamos que el include filtre.
        // NOTA: Esto significa que en la respuesta `services` solo vendrán los que matchearon el filtro.
        // Si el frontend necesita todos, ajustaremos a dos pasos.
        // DECISIÓN: Para esta iteración, si filtras servicios, ves servicios filtrados.

        // Normalizar respuesta para aplanar services
        return appointments.map(appt => {
            const plainAppt = appt.toJSON();

            // Aplanar array de servicios
            if (plainAppt.services && Array.isArray(plainAppt.services)) {
                plainAppt.services = plainAppt.services.map(pivot => {
                    const serviceData = pivot.service || {};
                    return {
                        id: pivot.service_id,
                        // Preferir datos del snapshot (pivot) si existen, si no, del maestro
                        name: pivot.service_name || serviceData.name,
                        price: pivot.price || serviceData.price,
                        duration_minutes: pivot.duration_minutes || serviceData.duration_minutes,
                        color: serviceData.color || '#cccccc', // Color viene del maestro
                        // Extra props si se requieren
                        appointment_service_id: pivot.id
                    };
                });
            }

            return plainAppt;
        });
    }

    // 📊 Datatable / Listado con búsqueda y paginación
    async datatable(params) {
        const { start, length, searchValue, orderColumn, orderDir, tenant_id } = params;

        const where = { tenant_id };

        // Búsqueda básica (se puede expandir para buscar por paciente/doctor si se hace con joins explícitos o subqueries)
        // Por ahora buscamos por notas o actividades
        if (searchValue && searchValue.trim() !== '') {
            where[Op.or] = [
                { notes: { [Op.like]: `%${searchValue}%` } },
                { activities: { [Op.like]: `%${searchValue}%` } }
            ];
        }

        const recordsTotal = await Appointment.count({ where: { tenant_id } });

        const defaultOrder = [['date', 'DESC'], ['start_time', 'ASC']];

        const finalOrder = orderColumn
            ? [[orderColumn, orderDir || "ASC"]]
            : defaultOrder;

        const { rows, count: recordsFiltered } = await Appointment.findAndCountAll({
            where,
            offset: start,
            limit: length,
            order: finalOrder,
            include: [
                { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name'] },
                { model: Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name'] },
                { model: ClinicArea, as: 'clinic_area', attributes: ['id', 'name'] }
            ]
        });

        return { recordsTotal, recordsFiltered, rows };
    }
    // 🟢 Guardar snapshot del proceso
    async saveProcessSnapshot(appointmentId, processData, transaction) {
        // 1. Crear Process Snapshot
        const snapshot = await AppointmentProcess.create({
            appointment_id: appointmentId,
            process_id: processData.process_id || null, // Optional link
            name_snapshot: processData.name || 'Proceso Personalizado',
            total_minutes: processData.steps.reduce((acc, s) => acc + (s.duration_minutes || 0), 0)
        }, { transaction });

        // 2. Crear Steps Snapshot
        if (processData.steps && processData.steps.length > 0) {
            const stepsPayload = processData.steps.map((s, index) => ({
                appointment_process_id: snapshot.id,
                step_id: s.step_id || null, // Optional link
                name_snapshot: s.name || 'Paso sin nombre',
                order_index: typeof s.order_index === 'number' ? s.order_index : index,
                duration_minutes: s.duration_minutes || 0
            }));
            await AppointmentProcessStep.bulkCreate(stepsPayload, { transaction });
        }

        return snapshot;
    }

    // 🟡 Remover snapshot existente (para updates)
    async removeProcessSnapshot(appointmentId, transaction) {
        return AppointmentProcess.destroy({
            where: { appointment_id: appointmentId },
            transaction
        });
    }

    // 🔍 Buscar citas para el Kiosko
    async findKioskAppointments(phoneNumber, tenantId, filters = {}) {
        // 1. Buscar Pacientes directamente por teléfono
        const patientsDirect = await Patient.findAll({
            where: { phone_number: phoneNumber, tenant_id: tenantId },
            attributes: ['id']
        });

        // 2. Buscar Representantes por teléfono
        const representatives = await PatientRepresentative.findAll({
            where: { phone: phoneNumber, tenant_id: tenantId },
            attributes: ['id']
        });

        // 3. Si hay representantes, buscar los pacientes vinculados
        let linkedPatientIds = [];
        if (representatives.length > 0) {
            const repIds = representatives.map(r => r.id);
            const links = await PatientRepresentativeLink.findAll({
                where: { representative_id: { [Op.in]: repIds }, tenant_id: tenantId },
                attributes: ['patient_id']
            });
            linkedPatientIds = links.map(l => l.patient_id);
        }

        // 4. Consolidar IDs de pacientes
        const allPatientIds = [...new Set([
            ...patientsDirect.map(p => p.id),
            ...linkedPatientIds
        ])];

        if (allPatientIds.length === 0) return [];

        // 5. Construir filtros de búsqueda
        const today = new Date().toISOString().split('T')[0];
        const where = {
            patient_id: { [Op.in]: allPatientIds },
            tenant_id: tenantId
        };

        // Estado: si viene null/undefined explícitamente se ignora el filtro de estado (para traer todos)
        // Por defecto para el Kiosco sigue siendo 'pendiente' si no se especifica filtros.status
        if (filters.status !== undefined && filters.status !== null) {
            where.status = filters.status;
        } else if (filters.status === undefined) {
             where.status = 'pendiente'; // Default behavior
        }

        // Fecha: si viene date se usa, sino >= today (default behavior)
        if (filters.date) {
            where.date = filters.date;
        } else {
            where.date = { [Op.gte]: today };
        }

        return Appointment.findAll({
            where,
            include: [
                { model: Patient, as: 'patient', attributes: ['first_name', 'last_name'] },
                { model: Employee, as: 'employee', attributes: ['first_name', 'last_name'] }
            ],
            order: [['date', 'ASC'], ['start_time', 'ASC']]
        });
    }

    // 🔍 Buscar todas las citas de un paciente
    async findAppointmentsByPatient(patientId, tenantId) {
        return await this.findAllWithFilters(tenantId, { patient_id: patientId });
    }
}

module.exports = new AppointmentRepository();

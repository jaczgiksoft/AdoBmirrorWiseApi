const { Op } = require('sequelize');
const Appointment = require('../../models/mysql/appointment.model');
const AppointmentService = require('../../models/mysql/appointment_service.model');
const Patient = require('../../models/mysql/patient.model');
const Employee = require('../../models/mysql/employee.model');
const ClinicArea = require('../../models/mysql/clinic_area.model');
const Service = require('../../models/mysql/service.model');

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
                { model: ClinicArea, as: 'clinic_area' }
            ]
        });
    }

    // 📋 Obtener todas las citas de un tenant
    async findAllByTenant(tenantId) {
        const appointments = await Appointment.findAll({
            where: { tenant_id: tenantId },
            order: [['date', 'DESC'], ['start_time', 'ASC']],
            include: [
                { model: Patient, as: 'patient' },
                { model: Employee, as: 'employee' },
                { model: ClinicArea, as: 'clinic_area' },
                {
                    model: AppointmentService,
                    as: 'services',
                    include: [
                        { model: Service, as: 'service', attributes: ['id', 'name', 'color', 'price', 'duration_minutes'] }
                    ]
                }
            ]
        });

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
}

module.exports = new AppointmentRepository();

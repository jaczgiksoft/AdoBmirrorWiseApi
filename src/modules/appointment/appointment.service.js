const sequelize = require('../../config/database');
const appointmentRepository = require('./appointment.repository');
const { createLog } = require('../../utils/log.helper');
const { logApiError } = require('../../utils/logApiError');
const { logger } = require('../../utils/logger');

class AppointmentService {
    // 🟢 Crear nueva cita
    async createAppointment(data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const allowedFields = [
                'patient_id',
                'employee_id',
                'clinic_area_id',
                'date',
                'start_time',
                'end_time',
                'unit_value',
                'units',
                'status',
                'activities',
                'notes',
                'total_amount'
            ];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            cleanData.tenant_id = currentUser.tenant_id;
            cleanData.created_by = currentUser.id;

            // 1. Crear Cita
            const newAppointment = await appointmentRepository.createAppointment(cleanData, t);

            // 2. Insertar Servicios (Pivot)
            if (data.services && Array.isArray(data.services) && data.services.length > 0) {
                const servicesData = data.services.map(svc => ({
                    appointment_id: newAppointment.id,
                    service_id: svc.service_id,
                    service_name: svc.service_name,
                    duration_minutes: svc.duration_minutes,
                    price: svc.price
                }));
                await appointmentRepository.addServices(servicesData, t);
            }

            await t.commit();

            // 🪵 Log de auditoría
            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'create',
                module: 'appointments',
                description: `Cita creada ID: ${newAppointment.id}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return newAppointment;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al crear cita: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🟡 Actualizar cita existente
    async updateAppointment(id, data, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado: falta tenant en el usuario');
        }

        const t = await sequelize.transaction();
        try {
            const appointment = await appointmentRepository.findById(id, currentUser.tenant_id);
            if (!appointment) throw new Error('Cita no encontrada');

            const allowedFields = [
                'patient_id',
                'employee_id',
                'clinic_area_id',
                'date',
                'start_time',
                'end_time',
                'unit_value',
                'units',
                'status',
                'activities',
                'notes',
                'total_amount',
                'treatment_started_at',
                'treatment_finished_at'
            ];
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedFields.includes(key))
            );

            // 1. Actualizar Cita
            await appointmentRepository.updateAppointment(appointment, cleanData, t);

            // 2. Actualizar Servicios (Estrategia: Borrar y Recrear PIVOT)
            if (data.services && Array.isArray(data.services)) {
                await appointmentRepository.removeServices(appointment.id, t);

                if (data.services.length > 0) {
                    const servicesData = data.services.map(svc => ({
                        appointment_id: appointment.id,
                        service_id: svc.service_id,
                        service_name: svc.service_name,
                        duration_minutes: svc.duration_minutes,
                        price: svc.price
                    }));
                    await appointmentRepository.addServices(servicesData, t);
                }
            }

            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'update',
                module: 'appointments',
                description: `Cita actualizada ID: ${appointment.id}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return appointment;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al actualizar cita: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 🔴 Eliminar cita
    async deleteAppointment(id, currentUser, req) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const t = await sequelize.transaction();
        try {
            const appointment = await appointmentRepository.findById(id, currentUser.tenant_id);
            if (!appointment) throw new Error('Cita no encontrada');

            await appointmentRepository.deleteAppointment(appointment, t);
            await t.commit();

            await createLog({
                user_id: currentUser.id,
                user_name: currentUser.username,
                action: 'delete',
                module: 'appointments',
                description: `Cita eliminada ID: ${appointment.id}`,
                ip: req.ip,
                user_agent: req.headers['user-agent']
            });

            return true;
        } catch (err) {
            await t.rollback();
            logger.error(`Error al eliminar cita: ${err.message}`);
            await logApiError(req, err);
            throw err;
        }
    }

    // 📋 Obtener todas las citas
    async getAllAppointments(currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }
        return await appointmentRepository.findAllByTenant(currentUser.tenant_id);
    }

    // 🔍 Obtener una cita por ID
    async getAppointmentById(id, currentUser) {
        if (!currentUser.tenant_id) {
            throw new Error('No autorizado');
        }

        const appointment = await appointmentRepository.findById(id, currentUser.tenant_id);
        if (!appointment) throw new Error('Cita no encontrada');
        return appointment;
    }

    // 📊 DataTable
    async getAppointmentsDatatable(body, currentUser) {
        const draw = parseInt(body.draw) || 1;
        const start = parseInt(body.start) || 0;
        const length = parseInt(body.length) || 10;
        const searchValue = body['search[value]'] || (body.search?.value ?? '');
        const orderColumnIndex = body['order[0][column]'] || (body.order?.[0]?.column ?? 0);
        const orderDir = (body['order[0][dir]'] || (body.order?.[0]?.dir ?? 'asc')).toUpperCase();

        const columns = [null, 'date', 'start_time', 'patient_id', 'employee_id', 'status', 'total_amount'];
        const orderColumn = columns[orderColumnIndex] || 'date';

        const params = { start, length, searchValue, orderColumn, orderDir, tenant_id: currentUser.tenant_id };

        const { recordsTotal, recordsFiltered, rows } = await appointmentRepository.datatable(params);

        return { draw, recordsTotal, recordsFiltered, data: rows };
    }
}

module.exports = new AppointmentService();

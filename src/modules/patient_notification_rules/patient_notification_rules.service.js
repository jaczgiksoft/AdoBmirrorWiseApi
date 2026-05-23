const patientNotificationRulesRepository = require('./patient_notification_rules.repository');
const notificationCatalogRepository = require('../notification_catalog/notification_catalog.repository');
const Patient = require('../../models/mysql/patient.model');
const sequelize = require('../../config/database');

class PatientNotificationRulesService {
    async getAll(tenantId) {
        return patientNotificationRulesRepository.findAllByTenant(tenantId);
    }

    async getById(id, tenantId) {
        const rule = await patientNotificationRulesRepository.findById(id, tenantId);
        if (!rule) {
            throw new Error('Regla de notificación no encontrada');
        }
        return rule;
    }

    async getByPatient(patientId, tenantId) {
        return patientNotificationRulesRepository.findAllByPatient(patientId, tenantId);
    }

    async create(data, tenantId, userId) {
        // 1. Validar Paciente
        const patient = await Patient.findOne({ where: { id: data.patient_id, tenant_id: tenantId } });
        if (!patient) {
            throw new Error('Paciente no encontrado o no pertenece a este Tenant');
        }

        // 2. Validar Plantilla si se especifica
        if (data.template_id) {
            const template = await notificationCatalogRepository.findTemplateById(data.template_id, tenantId);
            if (!template) {
                throw new Error('Plantilla de notificación no encontrada');
            }
        }

        // 3. Validar consistencia de fechas
        this.validateRuleDates(data);

        // 4. Calcular próxima ejecución
        const nextRunAt = this.calculateNextRun(data);

        const payload = {
            ...data,
            tenant_id: tenantId,
            created_by: userId,
            next_run_at: nextRunAt,
            is_active: data.is_active !== undefined ? data.is_active : true
        };

        const t = await sequelize.transaction();
        try {
            const rule = await patientNotificationRulesRepository.create(payload, t);
            await t.commit();
            return rule;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async update(id, data, tenantId) {
        const rule = await this.getById(id, tenantId);

        // Si se cambia de paciente
        if (data.patient_id && data.patient_id !== rule.patient_id) {
            const patient = await Patient.findOne({ where: { id: data.patient_id, tenant_id: tenantId } });
            if (!patient) {
                throw new Error('Paciente no encontrado o no pertenece a este Tenant');
            }
        }

        // Si se cambia de plantilla
        if (data.template_id && data.template_id !== rule.template_id) {
            const template = await notificationCatalogRepository.findTemplateById(data.template_id, tenantId);
            if (!template) {
                throw new Error('Plantilla de notificación no encontrada');
            }
        }

        // Fusión de datos viejos y nuevos para validación y recalculado de próxima fecha
        const mergedData = {
            ...rule.toJSON(),
            ...data
        };

        this.validateRuleDates(mergedData);
        const nextRunAt = this.calculateNextRun(mergedData);

        const allowedFields = [
            'patient_id',
            'template_id',
            'custom_title',
            'custom_message',
            'start_time',
            'end_time',
            'start_date',
            'end_date',
            'repeat_type',
            'repeat_days',
            'is_active',
            'context_data'
        ];

        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        );
        cleanData.next_run_at = nextRunAt;

        const t = await sequelize.transaction();
        try {
            const updated = await patientNotificationRulesRepository.update(rule, cleanData, t);
            await t.commit();
            return updated;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async delete(id, tenantId) {
        const rule = await this.getById(id, tenantId);

        const t = await sequelize.transaction();
        try {
            await patientNotificationRulesRepository.delete(rule, t);
            await t.commit();
            return { message: 'Regla de notificación eliminada correctamente' };
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    // ==========================================
    // HELPERS & VALIDATIONS
    // ==========================================
    validateRuleDates(data) {
        const { start_date, end_date, repeat_type } = data;

        if (start_date && end_date) {
            const start = new Date(start_date);
            const end = new Date(end_date);
            if (start > end) {
                throw new Error('La fecha de inicio (start_date) no puede ser posterior a la fecha de fin (end_date)');
            }
        }

        // Si es repeat_type "once" (ejecución única), pero ya pasó la fecha, advertir o validar
        if (repeat_type === 'once' && start_date) {
            const start = new Date(`${start_date}T00:00:00`);
            const today = new Date();
            today.setHours(0,0,0,0);
            if (start < today) {
                throw new Error('Para programaciones únicas (once), la fecha de inicio no puede estar en el pasado');
            }
        }
    }

    calculateNextRun(rule) {
        if (!rule.is_active) {
            return null;
        }

        const { start_date, start_time, repeat_type, repeat_days } = rule;
        
        // Determinar fecha base de inicio
        let baseDate = start_date ? new Date(`${start_date}T00:00:00`) : new Date();
        
        // Parsear hora de inicio
        const [hours, minutes, seconds] = start_time.split(':').map(Number);
        baseDate.setHours(hours || 0, minutes || 0, seconds || 0, 0);

        const now = new Date();

        if (repeat_type === 'once') {
            return baseDate >= now ? baseDate : null;
        }

        if (repeat_type === 'daily') {
            if (baseDate >= now) return baseDate;
            // Sumar 1 día hasta que sea a futuro
            while (baseDate < now) {
                baseDate.setDate(baseDate.getDate() + 1);
            }
            return baseDate;
        }

        if (repeat_type === 'weekly') {
            const weekdayMap = {
                Sunday: 0,
                Monday: 1,
                Tuesday: 2,
                Wednesday: 3,
                Thursday: 4,
                Friday: 5,
                Saturday: 6
            };

            const targetDays = Array.isArray(repeat_days) && repeat_days.length > 0
                ? repeat_days.map((day) => {
                    if (typeof day === 'number') return day;
                    return weekdayMap[day] ?? parseInt(day, 10);
                }).filter((value) => Number.isInteger(value) && value >= 0 && value <= 6)
                : [baseDate.getDay()];

            if (baseDate >= now && targetDays.includes(baseDate.getDay())) {
                return baseDate;
            }

            let checks = 0;
            while (checks < 14) { // Evitar bucle infinito
                baseDate.setDate(baseDate.getDate() + 1);
                if (baseDate >= now && targetDays.includes(baseDate.getDay())) {
                    return baseDate;
                }
                checks++;
            }
            return null;
        }

        if (repeat_type === 'monthly') {
            if (baseDate >= now) return baseDate;
            while (baseDate < now) {
                baseDate.setMonth(baseDate.getMonth() + 1);
            }
            return baseDate;
        }

        return baseDate >= now ? baseDate : now;
    }
}

module.exports = new PatientNotificationRulesService();

// src/config/notificationRules.js

/**
 * 🧠 MATRIZ DE NOTIFICACIONES POR EVENTO CLÍNICA DENTAL
 * Define qué roles deben recibir cada tipo de evento importante.
 * El superadmin (user.is_superadmin) siempre recibe todas.
 */

const NOTIFICATION_RULES = {
    // 🏥 Pacientes
    PATIENT_CREATED: ['Administrador General', 'Recepcionista', 'Odontólogo'],
    PATIENT_UPDATED: ['Administrador General', 'Odontólogo', 'Asistente Dental'],
    PATIENT_DELETED: ['Administrador General', 'Director Médico'],

    // ⚕️ Tratamientos y procedimientos
    TREATMENT_STARTED: ['Odontólogo', 'Asistente Dental', 'Director Médico'],
    TREATMENT_COMPLETED: ['Odontólogo', 'Director Médico', 'Recepcionista'],
    TREATMENT_CANCELLED: ['Administrador General', 'Director Médico'],

    // 📅 Citas
    APPOINTMENT_CREATED: ['Recepcionista', 'Odontólogo', 'Asistente Dental'],
    APPOINTMENT_UPDATED: ['Recepcionista', 'Odontólogo', 'Asistente Dental'],
    APPOINTMENT_CANCELLED: ['Recepcionista', 'Administrador General'],
    APPOINTMENT_REMINDER: ['Odontólogo', 'Asistente Dental'],

    // 💰 Pagos y finanzas
    PAYMENT_RECEIVED: ['Administrador General', 'Contador', 'Recepcionista'],
    REFUND_ISSUED: ['Administrador General', 'Contador'],
    INVOICE_GENERATED: ['Administrador General', 'Contador'],
    CASH_REGISTER_OPEN: ['Administrador General', 'Contador'],
    CASH_REGISTER_CLOSE: ['Administrador General', 'Contador'],

    // 🦷 Inventario y materiales
    SUPPLY_LOW_STOCK: ['Administrador General', 'Asistente Dental'],
    SUPPLY_ORDERED: ['Administrador General', 'Contador'],
    SUPPLY_RECEIVED: ['Administrador General', 'Asistente Dental'],

    // 👥 Personal / usuarios
    USER_CREATED: ['Administrador General'],
    USER_REMOVED: ['Administrador General'],
    EMPLOYEE_ADDED: ['Administrador General', 'Coordinador Clínico'],
    EMPLOYEE_REMOVED: ['Administrador General', 'Coordinador Clínico'],

    // ⚙️ Sistema y alertas
    SYSTEM_ERROR: ['Administrador General', 'Técnico de Sistemas'],
    BACKUP_STATUS: ['Administrador General', 'Técnico de Sistemas'],
    PATIENT_ALERT_CREATED: ['Odontólogo', 'Asistente Dental', 'Recepcionista'],
    PATIENT_ALERT_RESOLVED: ['Administrador General', 'Odontólogo'],
};

module.exports = { NOTIFICATION_RULES };

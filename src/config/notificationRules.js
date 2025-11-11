// src/config/notificationRules.js

/**
 * 🧠 MATRIZ DE NOTIFICACIONES POR EVENTO POS
 * Define qué roles deben recibir cada tipo de evento importante.
 * El superadmin (user.is_superadmin) siempre recibe todas.
 */

const NOTIFICATION_RULES = {
    // 🏪 Tiendas / configuración
    STORE_CREATED: ['Administrador General', 'Gerente de Tienda'],
    STORE_UPDATED: ['Administrador General', 'Gerente de Tienda'],
    STORE_DELETED: ['Administrador General', 'Gerente de Tienda'],

    // 💰 Finanzas / caja
    CASH_REGISTER_CREATED: ['Administrador General', 'Gerente de Tienda'],
    CASH_REGISTER_UPDATED: ['Administrador General', 'Gerente de Tienda'],
    CASH_REGISTER_DELETED: ['Administrador General', 'Gerente de Tienda'],
    CASH_OPEN_CLOSE: ['Gerente de Tienda', 'Contador'],
    CASH_MOVEMENT: ['Gerente de Tienda', 'Contador'],
    CASH_DIFFERENCE: ['Gerente de Tienda', 'Cajero', 'Contador'],
    CASH_REFUND: ['Gerente de Tienda', 'Supervisor de Caja'],

    // 📦 Inventario y almacén
    INVENTORY_ADJUSTMENT: ['Gerente de Tienda', 'Encargado de Almacén'],
    INVENTORY_ENTRY: ['Encargado de Almacén', 'Jefe de Compras'],
    LOW_STOCK: ['Jefe de Compras', 'Gerente de Tienda'],
    PRODUCT_EXPIRATION: ['Encargado de Almacén', 'Gerente de Tienda'],

    // 👥 Usuarios / RRHH
    USER_CREATED: ['Administrador General'],
    USER_REMOVED: ['Administrador General'],
    EMPLOYEE_ADDED: ['Jefe de Recursos Humanos', 'Gerente de Tienda'],
    EMPLOYEE_REMOVED: ['Jefe de Recursos Humanos', 'Gerente de Tienda'],

    // ⚙️ Sistema
    SYSTEM_ERROR: ['Administrador General', 'Técnico'],
    BACKUP_STATUS: ['Administrador General'],
};

module.exports = { NOTIFICATION_RULES };

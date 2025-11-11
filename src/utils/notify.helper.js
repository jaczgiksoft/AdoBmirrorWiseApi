// src/utils/notify.helper.js
const notificationRepository = require('../modules/notification/notification.repository');
const Role = require('../models/mysql/role.model');
const { NOTIFICATION_RULES } = require('../config/notificationRules');
const { logger } = require('./logger');

/**
 * 🔔 Envía una notificación a roles específicos según el tipo de evento POS.
 *
 * @param {Object} params
 * @param {number} params.tenant_id - ID del tenant
 * @param {string} params.event - Clave del evento (de NOTIFICATION_RULES)
 * @param {string} params.title - Título de la notificación
 * @param {string} params.message - Mensaje de la notificación
 * @param {string} [params.link] - Enlace opcional
 * @param {Object} [params.actor] - Usuario que genera la acción
 */
const notifyRoles = async ({ tenant_id, event, title, message, link, actor }) => {
    try {
        const baseRoles = NOTIFICATION_RULES[event];
        if (!baseRoles) {
            logger.warn(`⚠️ Evento no registrado en NOTIFICATION_RULES: ${event}`);
            return;
        }

        // 🔹 Obtener IDs de roles que coincidan con los nombres base
        const roles = await Role.findAll({
            where: { tenant_id, name: baseRoles },
            attributes: ['id']
        });
        const allowed_roles = roles.map(r => r.id);

        // 🔹 Si hay superadmin, lo agregamos siempre
        if (actor?.is_superadmin) {
            allowed_roles.push(-1); // marcador simbólico (puedes omitir si lo manejas con flag)
        }

        // 🔹 Crear la notificación global compartida
        await notificationRepository.createNotification({
            tenant_id,
            title,
            message,
            link,
            type: 'system',
            allowed_roles,
            read_by: [],
        });

        logger.info(`✅ Notificación "${title}" (${event}) creada para roles: [${baseRoles.join(', ')}]`);
    } catch (err) {
        logger.error(`❌ Error en notifyRoles(${event}): ${err.message}`);
    }
};

/**
 * ✉️ Envía una notificación individual (modo legacy)
 */
const notifyUser = async ({ user_id, tenant_id, title, message, link, type = 'user' }) => {
    try {
        if (type === 'user') {
            await notificationRepository.createNotification({
                tenant_id,
                user_id,
                title,
                message,
                link,
                type,
                read: false,
            });
            return;
        }

        // 🔹 Modo global antiguo
        logger.warn('⚠️ notifyUser en modo "system" está deprecado. Usa notifyRoles().');
    } catch (err) {
        logger.error(`❌ Error en notifyUser: ${err.message}`);
    }
};

module.exports = { notifyUser, notifyRoles };

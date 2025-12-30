const { Sequelize } = require('sequelize');

/**
 * Maneja errores de Sequelize y envía respuestas HTTP apropiadas.
 * Especialmente útil para violaciones de constraints UNIQUE.
 * 
 * @param {Object} res - Objeto de respuesta Express
 * @param {Error} err - Objeto de error capturado
 * @param {Object} [customMessages={}] - Mapa opcional de mensajes personalizados por campo o constraint.
 * @example
 * handleSequelizeError(res, err, { 
 *   name: 'El nombre ya existe',
 *   uq_services_tenant_name: 'Este servicio ya está registrado en esta sucursal'
 * });
 */
const handleSequelizeError = (res, err, customMessages = {}) => {
    // 1️⃣ Detectar error de unicidad (Unique Constraint)
    if (err instanceof Sequelize.UniqueConstraintError) {
        let message = 'El registro ya existe.';

        // Identificar claves candidatas para buscar mensaje personalizado
        const candidates = [];

        // Candidato A: Path del error (campo)
        if (err.errors && err.errors.length > 0 && err.errors[0].path) {
            candidates.push(err.errors[0].path);
        }

        // Candidato B: Constraint name (Postgres/Sequelize)
        if (err.parent && err.parent.constraint) {
            candidates.push(err.parent.constraint);
        }

        // Candidato C: Propiedad constraint directa
        if (err.constraint) {
            candidates.push(err.constraint);
        }

        // Buscar primer match en customMessages
        const foundKey = candidates.find(key => customMessages[key]);

        if (foundKey) {
            message = customMessages[foundKey];
        } else if (customMessages.default) {
            message = customMessages.default;
        }

        // RETORNO SEGURO: Nunca exponer valores crudos ni nombres de constraints si no hubo match
        return res.status(409).json({
            message: message,
            error: 'Conflict'
        });
    }

    // 2️⃣ Detectar error de validación (Validation Error)
    if (err instanceof Sequelize.ValidationError) {
        const messages = err.errors.map(e => e.message);
        return res.status(400).json({
            message: 'Error de validación',
            errors: messages
        });
    }

    // 3️⃣ Error genérico / Servidor
    console.error('❌ Error no manejado en Sequelize:', err);
    return res.status(500).json({
        message: err.message || 'Error interno del servidor'
    });
};

module.exports = { handleSequelizeError };

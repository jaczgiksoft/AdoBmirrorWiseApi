const { body, param} = require('express-validator');

const updatePermissionsValidator = [
    body().isArray().withMessage('El cuerpo debe ser un arreglo de permisos'),

    body('*.module')
        .notEmpty().withMessage('El módulo es obligatorio')
        .isString().withMessage('El módulo debe ser texto')
        .isAlphanumeric('es-ES', { ignore: '_-' })
        .withMessage('El módulo solo puede contener letras, números, guiones y guiones bajos'),

    body('*.can_read')
        .optional()
        .isBoolean().withMessage('El permiso can_read debe ser booleano')
        .toBoolean(),

    body('*.can_write')
        .optional()
        .isBoolean().withMessage('El permiso can_write debe ser booleano')
        .toBoolean(),

    body('*.can_edit')
        .optional()
        .isBoolean().withMessage('El permiso can_edit debe ser booleano')
        .toBoolean(),

    body('*.can_delete')
        .optional()
        .isBoolean().withMessage('El permiso can_delete debe ser booleano')
        .toBoolean()
];

const roleIdParamValidator = [
    param('role_id').isInt().withMessage('El ID debe ser un número entero')
];

module.exports = {
    updatePermissionsValidator,
    roleIdParamValidator
};

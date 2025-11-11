// src/modules/departmentStore/departmentStore.validator.js
const { body, param } = require('express-validator');

const setOverrideValidator = [
    body('department_id').isInt().withMessage('department_id debe ser un número entero'),
    body('store_id').isInt().withMessage('store_id debe ser un número entero'),
    body('use_parent_profit_margin')
        .isBoolean()
        .withMessage('use_parent_profit_margin debe ser booleano'),
    body('profit_margin_override')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('profit_margin_override debe ser un número positivo'),
];

const deleteOverrideValidator = [
    param('departmentId').isInt().withMessage('departmentId inválido'),
    param('storeId').isInt().withMessage('storeId inválido'),
];

module.exports = { setOverrideValidator, deleteOverrideValidator };

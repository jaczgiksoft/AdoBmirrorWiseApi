// src/modules/patient_type/patient_type.validator.js
const { body, param } = require("express-validator");

module.exports = {
    createValidator: [
        body("name").notEmpty().withMessage("El nombre es obligatorio"),
        body("color").optional().isString(),
    ],

    updateValidator: [
        param("id").isInt(),
        body("name").optional().notEmpty(),
        body("color").optional().isString(),
    ],

    idValidator: [
        param("id").isInt().withMessage("ID inválido"),
    ],
};

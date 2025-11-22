// src/modules/patient_type/patient_type.routes.js
const express = require("express");
const router = express.Router();

const controller = require("./patient_type.controller");
const { validateToken } = require("../../middlewares/auth.middleware");
const loadPermissions = require("../../middlewares/loadPermissions.middleware");
const { checkPermissions } = require("../../middlewares/permissions.middleware");
const { createValidator, updateValidator, idValidator } = require("./patient_type.validator");
const { validateRequest } = require("../../middlewares/validate.middleware");

// Listar
router.get(
    "/",
    validateToken,
    loadPermissions,
    checkPermissions("read", "patient_types"),
    controller.list
);

// Obtener uno
router.get(
    "/:id",
    validateToken,
    loadPermissions,
    checkPermissions("read", "patient_types"),
    idValidator,
    validateRequest,
    controller.get
);

// Crear
router.post(
    "/",
    validateToken,
    loadPermissions,
    checkPermissions("write", "patient_types"),
    createValidator,
    validateRequest,
    controller.create
);

// Actualizar
router.put(
    "/:id",
    validateToken,
    loadPermissions,
    checkPermissions("edit", "patient_types"),
    updateValidator,
    validateRequest,
    controller.update
);

// Eliminar
router.delete(
    "/:id",
    validateToken,
    loadPermissions,
    checkPermissions("delete", "patient_types"),
    idValidator,
    validateRequest,
    controller.delete
);

module.exports = router;

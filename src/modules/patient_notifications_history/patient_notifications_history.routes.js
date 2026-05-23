const express = require('express');
const patientNotificationsHistoryController = require('./patient_notifications_history.controller');
const { validateToken } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(validateToken); // Todos los endpoints requieren autenticación

router.get('/:id', patientNotificationsHistoryController.getById);
router.get('/patient/:patient_id', patientNotificationsHistoryController.getByPatient);

module.exports = router;

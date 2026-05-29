const express = require('express');
const patientNotificationsHistoryController = require('./patient_notifications_history.controller');
const { validateToken } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(validateToken); // Todos los endpoints requieren autenticación

router.get('/:id', patientNotificationsHistoryController.getById);
router.get('/patient/:patient_id', patientNotificationsHistoryController.getByPatient);

router.patch('/:id/read', patientNotificationsHistoryController.markAsRead);
router.patch('/patient/:patient_id/read-all', patientNotificationsHistoryController.markAllAsRead);

module.exports = router;

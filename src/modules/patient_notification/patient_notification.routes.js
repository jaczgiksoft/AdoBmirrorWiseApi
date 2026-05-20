const express = require('express');
const patientNotificationController = require('./patient_notification.controller');
const { validateToken } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(validateToken); // Todos los endpoints requieren token de autenticación

router.get('/', patientNotificationController.getAll);
router.get('/:id', patientNotificationController.getById);
router.get('/patient/:patient_id', patientNotificationController.getByPatient);
router.post('/', patientNotificationController.create);
router.put('/:id', patientNotificationController.update);
router.delete('/:id', patientNotificationController.remove);

module.exports = router;

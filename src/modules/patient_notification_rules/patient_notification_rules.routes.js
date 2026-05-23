const express = require('express');
const patientNotificationRulesController = require('./patient_notification_rules.controller');
const { validateToken } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validate.middleware');
const { createRuleValidator, updateRuleValidator } = require('./patient_notification_rules.validator');

const router = express.Router();

router.use(validateToken); // Todos los endpoints requieren autenticación

router.get('/', patientNotificationRulesController.getAll);
router.get('/:id', patientNotificationRulesController.getById);
router.get('/patient/:patient_id', patientNotificationRulesController.getByPatient);
router.post('/', createRuleValidator, validateRequest, patientNotificationRulesController.create);
router.put('/:id', updateRuleValidator, validateRequest, patientNotificationRulesController.update);
router.delete('/:id', patientNotificationRulesController.remove);

module.exports = router;

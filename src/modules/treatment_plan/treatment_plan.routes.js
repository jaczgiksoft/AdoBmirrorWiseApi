const express = require('express');
const router = express.Router();
const treatmentPlanController = require('./treatment_plan.controller');
const { validateToken } = require('../../middlewares/auth.middleware');

router.post('/', validateToken, treatmentPlanController.create);
router.get('/patient/:patientId', validateToken, treatmentPlanController.getByPatient);
router.delete('/:id', validateToken, treatmentPlanController.delete);

module.exports = router;

const express = require('express');
const notificationTypeController = require('./notification_type.controller');
const { validateToken } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(validateToken); // Todos los endpoints requieren token de autenticación

router.get('/', notificationTypeController.getAll);
router.get('/:id', notificationTypeController.getById);
router.post('/', notificationTypeController.create);
router.put('/:id', notificationTypeController.update);
router.delete('/:id', notificationTypeController.remove);

module.exports = router;

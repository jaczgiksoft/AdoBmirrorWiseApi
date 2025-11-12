const { Router } = require('express');
const router = Router();

// ==========================
// 🔐 AUTH & USERS
// ==========================
router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/users', require('../modules/user/user.routes'));
router.use('/roles', require('../modules/role/role.routes'));
router.use('/permissions', require('../modules/permission/permission.routes'));

// ==========================
// 🏢 TENANT & CONFIGURACIÓN
// ==========================
router.use('/tenants', require('../modules/tenant/tenant.routes'));
router.use('/tenant-features', require('../modules/tenantFeature/tenantFeature.routes'));

// ==========================
// 🧩 SISTEMA
// ==========================
router.use('/notifications', require('../modules/notification/notification.routes'));
router.use('/logs', require('../modules/log/log.routes'));

// ==========================
// 🦷 BWISE DENTAL MODULES
// ==========================
// router.use('/referrals', require('../modules/referral/referral.routes'));
// router.use('/occupations', require('../modules/occupation/occupation.routes'));
// router.use('/patient-types', require('../modules/patientType/patientType.routes'));
// router.use('/patient-statuses', require('../modules/patientStatus/patientStatus.routes'));
router.use('/bracket-types', require('../modules/bracket_type/bracket_type.routes'));
// router.use('/patient-professions', require('../modules/patientProfession/patientProfession.routes'));
router.use('/patients', require('../modules/patient/patient.routes'));
router.use('/patient-alerts', require('../modules/patient_alert/patient_alert.routes'));

module.exports = router;

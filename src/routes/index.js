const { Router } = require('express');
const router = Router();

// ==========================
// 🔐 AUTH & USERS
// ==========================
router.use('/auth', require('../modules/auth/auth.routes'));
// ==========================
// 🔐 AUTH & USERS
// ==========================
router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/users', require('../modules/user/user.routes'));
router.use('/employees', require('../modules/employee/employee.routes'));
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
router.use('/referrals', require('../modules/referral/referral.routes'));
router.use('/occupations', require('../modules/occupation/occupation.routes'));
router.use('/positions', require('../modules/positions/position.routes'));
router.use('/patient-types', require('../modules/patient_type/patient_type.routes'));
router.use('/bracket-types', require('../modules/bracket_type/bracket_type.routes'));
// router.use('/patient-professions', require('../modules/patientProfession/patientProfession.routes'));
router.use('/patients', require('../modules/patient/patient.routes'));
router.use('/patient-alerts', require('../modules/patient_alert/patient_alert.routes'));
router.use('/patient-extractions', require('../modules/patient_extraction/patient_extraction.routes'));
router.use('/extraction-orders', require('../modules/extraction_order/extraction_order.routes'));
router.use('/patient-hobbies', require('../modules/patient_hobby/patient_hobby.routes'));
router.use('/patient-notes', require('../modules/patient_note/patient_note.routes'));
router.use('/patient-conversations', require('../modules/patient_conversation/patient_conversation.routes'));
router.use('/patient-representatives', require('../modules/patient_representative/patient_representative.routes'));
router.use('/patient-representative-links', require('../modules/patient_representative_link/patient_representative_link.routes'));
router.use('/patient-prescriptions', require('../modules/patient_prescription/patient_prescription.routes'));
router.use('/appointments', require('../modules/appointment/appointment.routes'));
router.use('/services', require('../modules/service/service.routes'));
router.use('/processes', require('../modules/process/process.routes'));
router.use('/steps', require('../modules/step/step.routes'));
router.use('/clinic-areas', require('../modules/clinic_area/clinic_area.routes'));
router.use('/treatment-catalogs', require('../modules/treatment_catalog/treatment_catalog.routes'));
router.use('/treatment-plans', require('../modules/treatment_plan/treatment_plan.routes'));
router.use('/budgets', require('../modules/budget/budget.routes'));
router.use('/billing-data', require('../modules/billing_data/billing_data.routes'));
router.use('/patient-billing-data', require('../modules/patient_billing_data/patient_billing_data.routes'));
router.use('/odontograms', require('../modules/odontogram/odontogram.routes'));
router.use('/patient-elastics', require('../modules/patient_elastic/patient_elastic.routes'));
router.use('/patient-gallery', require('../modules/patient_gallery/patient_gallery.routes'));
router.use('/patient-clinical', require('../modules/patient_clinical/patient_clinical.routes'));
router.use('/attendance', require('../modules/attendance/attendance.routes'));

// ==========================
// 📦 INVENTORY
// ==========================
router.use('/inventory-providers', require('../modules/inventory_provider/inventory_provider.routes'));
router.use('/inventory-items', require('../modules/inventory_item/inventory_item.routes'));
router.use('/inventory-movements', require('../modules/inventory_movement/inventory_movement.routes'));

module.exports = router;

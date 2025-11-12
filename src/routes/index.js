const { Router } = require('express');
const router = Router();

// 🔐 Auth & Users
router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/users', require('../modules/user/user.routes'));
router.use('/roles', require('../modules/role/role.routes'));
router.use('/permissions', require('../modules/permission/permission.routes'));

// 🏢 Tenant & Configuración
router.use('/tenants', require('../modules/tenant/tenant.routes'));
router.use('/tenant-features', require('../modules/tenantFeature/tenantFeature.routes'));
router.use('/stores', require('../modules/store/store.routes'));

// 💰 POS: Cajas, Sesiones y Movimientos
router.use('/cash-registers', require('../modules/cashRegister/cashRegister.routes'));
router.use('/cash-sessions', require('../modules/cashSession/cashSession.routes'));
router.use('/cash-movements', require('../modules/cashMovement/cashMovement.routes'));

// 📦 Dependencias de Productos
router.use('/categories', require('../modules/category/category.routes'));
router.use('/departments', require('../modules/department/department.routes'));
router.use('/brands', require('../modules/brand/brand.routes'));
router.use('/units', require('../modules/unit/unit.routes'));
router.use('/taxes', require('../modules/tax/tax.routes'));

// 🏬 Departamentos ↔ Tiendas (margen local por tienda)
router.use('/department-stores', require('../modules/departmentStore/departmentStore.routes')); // 🆕

// 🛒 Productos
router.use('/products', require('../modules/product/product.routes'));
router.use('/product-stores', require('../modules/productStore/productStore.routes'));
router.use('/inventory-movements', require('../modules/inventoryMovement/inventoryMovement.routes'));

// 🔔 Notificaciones y Logs
router.use('/notifications', require('../modules/notification/notification.routes'));
router.use('/logs', require('../modules/log/log.routes'));

// 🦷 BWISE DENTAL MODULES
// router.use('/referrals', require('../modules/referral/referral.routes'));
// router.use('/occupations', require('../modules/occupation/occupation.routes'));
// router.use('/patient-types', require('../modules/patientType/patientType.routes'));
// router.use('/patient-statuses', require('../modules/patientStatus/patientStatus.routes'));
// router.use('/bracket-types', require('../modules/bracketType/bracketType.routes'));
// router.use('/patient-professions', require('../modules/patientProfession/patientProfession.routes'));
router.use('/patients', require('../modules/patient/patient.routes'));

router.use('/patient-alerts', require('../modules/patient_alert/patient_alert.routes'));

module.exports = router;

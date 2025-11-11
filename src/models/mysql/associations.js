const Tenant = require('./tenant.model');
const Role = require('./role.model');
const Permission = require('./permission.model');
const User = require('./user.model');
const TenantModule = require('./tenant_module.model');
const Subscription = require('./subscription.model');
const TenantFeature = require('./tenant_feature.model'); // 🔹 nuevo
const Store = require('./store.model'); // 🔹 nuevo
const CashRegister = require('./cashRegister.model'); // 🔹 nuevo
const CashSession = require('./cashSession.model'); // 🔹 nuevo
const CashMovement = require('./cashMovement.model'); // 🔹 nuevo
const Category = require('./category.model'); // 🔹 nuevo
const Department = require('./department.model'); // 🔹 nuevo
const DepartmentStore = require('./departmentStore.model'); // 🔹 nuevo
const Brand = require('./brand.model'); // 🔹 nuevo
const Unit = require('./unit.model'); // 🔹 nuevo
const Tax = require('./tax.model'); // 🔹 nuevo
const Product = require('./product.model'); // 🔹 nuevo
const ProductStore = require('./productStore.model'); // 🔹 nuevo
const InventoryMovement = require('./inventoryMovement.model'); // 🔹 nuevo
const Supplier = require('./supplier.model'); // 🔹 nuevo

const Referral = require('./referral.model'); // 🔹 nuevo bwise
const Occupation = require('./occupation.model'); // 🔹 nuevo bwise
const PatientType = require('./patient_type.model'); // 🔹 nuevo bwise
const PatientStatus = require('./patient_status.model'); // 🔹 nuevo bwise
const BracketType = require('./bracket_type.model'); // 🔹 nuevo bwise
const Patient = require('./patient.model');  // 🔹 nuevo bwise

// =====================
// TENANTS
// =====================
Tenant.hasMany(User, { foreignKey: 'tenant_id', as: 'users', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tenant.hasMany(Role, { foreignKey: 'tenant_id', as: 'roles', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tenant.hasMany(Permission, { foreignKey: 'tenant_id', as: 'permissions', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tenant.hasMany(TenantModule, { foreignKey: 'tenant_id', as: 'modules', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tenant.hasMany(Subscription, { foreignKey: 'tenant_id', as: 'subscriptions', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tenant.hasMany(TenantFeature, { foreignKey: 'tenant_id', as: 'features', onDelete: 'CASCADE', onUpdate: 'CASCADE' }); // 🔹 nuevo

Tenant.belongsTo(Subscription, { foreignKey: 'current_subscription_id', as: 'currentSubscription', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// =====================
// USERS
// =====================
User.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role', onDelete: 'RESTRICT' });

// =====================
// ROLES y PERMISSIONS
// =====================
Role.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users', onDelete: 'RESTRICT' });
Role.hasMany(Permission, { foreignKey: 'role_id', as: 'permissions', onDelete: 'CASCADE' });

Permission.belongsTo(Role, { foreignKey: 'role_id', as: 'role', onDelete: 'CASCADE' });
Permission.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE' });

// =====================
// TENANT MODULES
// =====================
TenantModule.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE' });

// =====================
// TENANT FEATURES
// =====================
TenantFeature.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE' });

// =====================
// SUBSCRIPTIONS
// =====================
Subscription.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE' });

// =====================
// STORE
// =====================
Tenant.hasMany(Store, { foreignKey: 'tenant_id', as: 'stores', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Store.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE' });

Store.hasMany(User, { foreignKey: 'store_id', as: 'users', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
User.belongsTo(Store, { foreignKey: 'store_id', as: 'store', onDelete: 'SET NULL' });

// =====================
// CASH REGISTER
// =====================
Tenant.hasMany(CashRegister, { foreignKey: 'tenant_id', as: 'cashRegisters', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
CashRegister.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE' });

Store.hasMany(CashRegister, { foreignKey: 'store_id', as: 'cashRegisters', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
CashRegister.belongsTo(Store, { foreignKey: 'store_id', as: 'store', onDelete: 'CASCADE' });

// =====================
// CASH SESSION
// =====================
Tenant.hasMany(CashSession, {foreignKey: 'tenant_id', as: 'cashSessions', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
CashSession.belongsTo(Tenant, {foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

Store.hasMany(CashSession, {foreignKey: 'store_id', as: 'cashSessions', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
CashSession.belongsTo(Store, {foreignKey: 'store_id', as: 'store', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

CashRegister.hasMany(CashSession, {foreignKey: 'cash_register_id', as: 'cashSessions', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
CashSession.belongsTo(CashRegister, {foreignKey: 'cash_register_id', as: 'cashRegister', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

User.hasMany(CashSession, {foreignKey: 'user_id', as: 'cashSessions', onDelete: 'SET NULL', onUpdate: 'CASCADE'});
CashSession.belongsTo(User, {foreignKey: 'user_id', as: 'user', onDelete: 'SET NULL', onUpdate: 'CASCADE'});

// =====================
// CASH MOVEMENT
// =====================
Tenant.hasMany(CashMovement, {foreignKey: 'tenant_id', as: 'cashMovements', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
CashMovement.belongsTo(Tenant, {foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

Store.hasMany(CashMovement, {foreignKey: 'store_id', as: 'cashMovements', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
CashMovement.belongsTo(Store, {foreignKey: 'store_id', as: 'store', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

CashRegister.hasMany(CashMovement, {foreignKey: 'cash_register_id', as: 'cashMovements', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
CashMovement.belongsTo(CashRegister, {foreignKey: 'cash_register_id', as: 'cashRegister', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

CashSession.hasMany(CashMovement, {foreignKey: 'cash_session_id', as: 'cashMovements', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
CashMovement.belongsTo(CashSession, {foreignKey: 'cash_session_id', as: 'cashSession', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

User.hasMany(CashMovement, {foreignKey: 'user_id', as: 'cashMovements', onDelete: 'SET NULL', onUpdate: 'CASCADE'});
CashMovement.belongsTo(User, {foreignKey: 'user_id', as: 'user', onDelete: 'SET NULL', onUpdate: 'CASCADE'});

// =====================
// PRODUCT DEPENDENCIES
// =====================
Tenant.hasMany(Brand, { foreignKey: 'tenant_id', as: 'brands', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Brand.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Tenant.hasMany(Department, { foreignKey: 'tenant_id', as: 'departments', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Department.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// PRODUCT ↔ DEPENDENCIES
// =====================
Tenant.hasMany(Product, { foreignKey: 'tenant_id', as: 'products', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Product.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Category.hasMany(Product, { foreignKey: 'category_id', as: 'products', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

Unit.hasMany(Product, { foreignKey: 'unit_id', as: 'products', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Product.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

Tax.hasMany(Product, { foreignKey: 'tax_id', as: 'products', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Product.belongsTo(Tax, { foreignKey: 'tax_id', as: 'tax', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

Tenant.hasMany(ProductStore, { foreignKey: 'tenant_id', as: 'productStores', onDelete: 'CASCADE', onUpdate: 'CASCADE', });
ProductStore.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE', });

// =====================
// PRODUCT ↔ STORE
// =====================
Product.hasMany(ProductStore, {foreignKey: 'product_id', as: 'productStores', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
ProductStore.belongsTo(Product, {foreignKey: 'product_id', as: 'product', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

Store.hasMany(ProductStore, {foreignKey: 'store_id', as: 'productStores', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
ProductStore.belongsTo(Store, {foreignKey: 'store_id', as: 'store', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

// =====================
// PRODUCT ↔ STORE (Many-to-Many Shortcut)
// =====================
Store.belongsToMany(Product, { through: ProductStore, foreignKey: 'store_id', otherKey: 'product_id', as: 'products', });
Product.belongsToMany(Store, { through: ProductStore, foreignKey: 'product_id', otherKey: 'store_id', as: 'stores', });

// =====================
// DEPARTMENT ↔ STORE (override de margen por tienda)
// =====================
Department.hasMany(DepartmentStore, { foreignKey: 'department_id', as: 'departmentStores', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
DepartmentStore.belongsTo(Department, { foreignKey: 'department_id', as: 'department', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Store.hasMany(DepartmentStore, { foreignKey: 'store_id', as: 'departmentStores', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
DepartmentStore.belongsTo(Store, { foreignKey: 'store_id', as: 'store', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Many-to-many directo (para consultas más simples)
Department.belongsToMany(Store, { through: DepartmentStore, foreignKey: 'department_id', otherKey: 'store_id', as: 'stores', });
Store.belongsToMany(Department, { through: DepartmentStore, foreignKey: 'store_id', otherKey: 'department_id', as: 'departments', });

// =====================
// PRODUCT ↔ DEPARTMENT_STORE
// =====================
DepartmentStore.hasMany(Product, { foreignKey: 'department_store_id', as: 'products', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

Product.belongsTo(DepartmentStore, { foreignKey: 'department_store_id', as: 'departmentStore', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// =====================
// OVERRIDE DE IMPUESTOS
// =====================
Tax.hasMany(ProductStore, {foreignKey: 'tax_id_override', as: 'productStoresOverride', onDelete: 'SET NULL', onUpdate: 'CASCADE'});
ProductStore.belongsTo(Tax, {foreignKey: 'tax_id_override', as: 'taxOverride', onDelete: 'SET NULL', onUpdate: 'CASCADE'});

// =====================
// INVENTORY MOVEMENTS
// =====================

// TENANT ↔ INVENTORY MOVEMENTS
Tenant.hasMany(InventoryMovement, { foreignKey: 'tenant_id', as: 'inventoryMovements', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
InventoryMovement.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// STORE ↔ INVENTORY MOVEMENTS
Store.hasMany(InventoryMovement, { foreignKey: 'store_id', as: 'inventoryMovements', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
InventoryMovement.belongsTo(Store, { foreignKey: 'store_id', as: 'store', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// PRODUCT ↔ INVENTORY MOVEMENTS
Product.hasMany(InventoryMovement, { foreignKey: 'product_id', as: 'inventoryMovements', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
InventoryMovement.belongsTo(Product, { foreignKey: 'product_id', as: 'product', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// USER ↔ INVENTORY MOVEMENTS
User.hasMany(InventoryMovement, { foreignKey: 'user_id', as: 'inventoryMovements', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
InventoryMovement.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// =====================
// SUPPLIERS
// =====================
Tenant.hasMany(Supplier, { foreignKey: 'tenant_id', as: 'suppliers', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Supplier.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// BWISE DENTAL MODULES
// =====================

// =====================
// REFERRALS
// =====================
// TENANT ↔ REFERRAL
Tenant.hasMany(Referral, { foreignKey: 'tenant_id', as: 'referrals', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Referral.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// OCCUPATIONS
// =====================
// TENANT ↔ OCCUPATION
Tenant.hasMany(Occupation, { foreignKey: 'tenant_id', as: 'occupations', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Occupation.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// PATIENT TYPES
// =====================
// TENANT ↔ PATIENT TYPE
Tenant.hasMany(PatientType, { foreignKey: 'tenant_id', as: 'patient_types', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PatientType.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// PATIENT STATUS
// =====================
// TENANT ↔ PATIENT STATUS
Tenant.hasMany(PatientStatus, { foreignKey: 'tenant_id', as: 'patient_statuses', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PatientStatus.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// BRACKET TYPES
// =====================
// TENANT ↔ BRACKET TYPE
Tenant.hasMany(BracketType, { foreignKey: 'tenant_id', as: 'bracket_types', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
BracketType.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

const PatientProfession = require('./patient_profession.model');

// =====================
// PATIENT PROFESSIONS
// =====================
// TENANT ↔ PATIENT PROFESSION
Tenant.hasMany(PatientProfession, { foreignKey: 'tenant_id', as: 'patient_professions', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PatientProfession.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// PATIENTS
// =====================
// TENANT ↔ PATIENT
Tenant.hasMany(Patient, { foreignKey: 'tenant_id', as: 'patients', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Patient.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// RELACIONES OPCIONALES (catálogos)
Patient.belongsTo(Referral, { foreignKey: 'referral_id', as: 'referral', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Patient.belongsTo(Occupation, { foreignKey: 'occupation_id', as: 'occupation', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Patient.belongsTo(PatientType, { foreignKey: 'patient_type_id', as: 'type', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Patient.belongsTo(PatientStatus, { foreignKey: 'patient_status_id', as: 'status', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Patient.belongsTo(BracketType, { foreignKey: 'bracket_type_id', as: 'bracket_type', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Patient.belongsTo(PatientProfession, {foreignKey: 'patient_profession_id', as: 'profession', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// =====================
// RELACIONES INVERSAS (Catálogos → Pacientes)
// =====================

// REFERRAL ↔ PATIENT
Referral.hasMany(Patient, { foreignKey: 'referral_id', as: 'patients', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
// OCCUPATION ↔ PATIENT
Occupation.hasMany(Patient, { foreignKey: 'occupation_id', as: 'patients', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
// PATIENT TYPE ↔ PATIENT
PatientType.hasMany(Patient, { foreignKey: 'patient_type_id', as: 'patients', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
// PATIENT STATUS ↔ PATIENT
PatientStatus.hasMany(Patient, { foreignKey: 'patient_status_id', as: 'patients', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
// BRACKET TYPE ↔ PATIENT
BracketType.hasMany(Patient, { foreignKey: 'bracket_type_id', as: 'patients', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
// PATIENT PROFESSION ↔ PATIENT
PatientProfession.hasMany(Patient, {foreignKey: 'patient_profession_id', as: 'patients', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
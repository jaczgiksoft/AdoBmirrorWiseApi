// =====================
// CORE MODELS
// =====================
const Tenant = require('./tenant.model');
const Role = require('./role.model');
const Permission = require('./permission.model');
const User = require('./user.model');
const TenantModule = require('./tenant_module.model');
const Subscription = require('./subscription.model');
const TenantFeature = require('./tenant_feature.model');

// =====================
// BWISE DENTAL MODELS
// =====================
const Referral = require('./referral.model');
const Occupation = require('./occupation.model');
const PatientType = require('./patient_type.model');
const PatientStatus = require('./patient_status.model');
const BracketType = require('./bracket_type.model');
const Patient = require('./patient.model');
const PatientPatientType = require('./patient_patient_type.model');
const PatientAlert = require('./patient_alert.model');
const PatientProfession = require('./patient_profession.model');

// =====================
// TENANTS
// =====================
Tenant.hasMany(User, { foreignKey: 'tenant_id', as: 'users', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tenant.hasMany(Role, { foreignKey: 'tenant_id', as: 'roles', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tenant.hasMany(Permission, { foreignKey: 'tenant_id', as: 'permissions', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tenant.hasMany(TenantModule, { foreignKey: 'tenant_id', as: 'modules', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tenant.hasMany(Subscription, { foreignKey: 'tenant_id', as: 'subscriptions', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tenant.hasMany(TenantFeature, { foreignKey: 'tenant_id', as: 'features', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Tenant.belongsTo(Subscription, { foreignKey: 'current_subscription_id', as: 'currentSubscription', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// =====================
// USERS
// =====================
User.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role', onDelete: 'RESTRICT' });

// =====================
// ROLES & PERMISSIONS
// =====================
Role.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users', onDelete: 'RESTRICT' });
Role.hasMany(Permission, { foreignKey: 'role_id', as: 'permissions', onDelete: 'CASCADE' });

Permission.belongsTo(Role, { foreignKey: 'role_id', as: 'role', onDelete: 'CASCADE' });
Permission.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE' });

// =====================
// TENANT MODULES & FEATURES
// =====================
TenantModule.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE' });
TenantFeature.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE' });

// =====================
// SUBSCRIPTIONS
// =====================
Subscription.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE' });

// =====================
// BWISE DENTAL RELATIONS
// =====================

// REFERRALS
Tenant.hasMany(Referral, { foreignKey: 'tenant_id', as: 'referrals', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Referral.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// OCCUPATIONS
Tenant.hasMany(Occupation, { foreignKey: 'tenant_id', as: 'occupations', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Occupation.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// PATIENT TYPES
Tenant.hasMany(PatientType, { foreignKey: 'tenant_id', as: 'patient_types', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PatientType.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// PATIENT STATUS
Tenant.hasMany(PatientStatus, { foreignKey: 'tenant_id', as: 'patient_statuses', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PatientStatus.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// BRACKET TYPES
Tenant.hasMany(BracketType, { foreignKey: 'tenant_id', as: 'bracket_types', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
BracketType.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// PATIENT PROFESSIONS
Tenant.hasMany(PatientProfession, { foreignKey: 'tenant_id', as: 'patient_professions', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PatientProfession.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// PATIENTS
Tenant.hasMany(Patient, { foreignKey: 'tenant_id', as: 'patients', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Patient.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// RELACIONES OPCIONALES (catálogos)
Patient.belongsTo(Referral, { foreignKey: 'referral_id', as: 'referral', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Patient.belongsTo(Occupation, { foreignKey: 'occupation_id', as: 'occupation', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Patient.belongsTo(PatientStatus, { foreignKey: 'patient_status_id', as: 'status', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Patient.belongsTo(BracketType, { foreignKey: 'bracket_type_id', as: 'bracket_type', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Patient.belongsTo(PatientProfession, { foreignKey: 'patient_profession_id', as: 'profession', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// 🔁 Relación N:M entre pacientes y tipos
Patient.belongsToMany(PatientType, {
    through: PatientPatientType,
    as: 'types',
    foreignKey: 'patient_id',
    otherKey: 'patient_type_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
PatientType.belongsToMany(Patient, {
    through: PatientPatientType,
    as: 'patients',
    foreignKey: 'patient_type_id',
    otherKey: 'patient_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// RELACIONES INVERSAS (Catálogos → Pacientes)
Referral.hasMany(Patient, { foreignKey: 'referral_id', as: 'patients', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Occupation.hasMany(Patient, { foreignKey: 'occupation_id', as: 'patients', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
PatientStatus.hasMany(Patient, { foreignKey: 'patient_status_id', as: 'patients', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
BracketType.hasMany(Patient, { foreignKey: 'bracket_type_id', as: 'patients', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
PatientProfession.hasMany(Patient, { foreignKey: 'patient_profession_id', as: 'patients', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// PATIENT ALERTS
Tenant.hasMany(PatientAlert, { foreignKey: 'tenant_id', as: 'patient_alerts', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PatientAlert.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

Patient.hasMany(PatientAlert, { foreignKey: 'patient_id', as: 'alerts', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
PatientAlert.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

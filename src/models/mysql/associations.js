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
const Employee = require('./employee.model');
const UserRole = require('./user_role.model');

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
const PatientHobby = require('./patient_hobby.model');
const PatientPrescription = require('./patient_prescription.model');
const PatientNote = require('./patient_note.model');
const PatientConversation = require('./patient_conversation.model');
const PatientExtraction = require('./patient_extraction.model');
const ExtractionTooth = require('./extraction_tooth.model');
const ExtractionFile = require('./extraction_file.model');

const BillingData = require('./billing_data.model');
const PatientBillingData = require('./patient_billing_data.model');

const PatientRepresentative = require('./patient_representative.model');
const PatientRepresentativeLink = require('./patient_representative_link.model');

// =====================
// TENANTS
// =====================

Tenant.hasMany(Role, {
    foreignKey: 'tenant_id',
    as: 'roles',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Tenant.hasMany(Permission, {
    foreignKey: 'tenant_id',
    as: 'permissions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Tenant.hasMany(TenantModule, {
    foreignKey: 'tenant_id',
    as: 'modules',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Tenant.hasMany(Subscription, {
    foreignKey: 'tenant_id',
    as: 'subscriptions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Tenant.hasMany(TenantFeature, {
    foreignKey: 'tenant_id',
    as: 'features',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Tenant.belongsTo(Subscription, {
    foreignKey: 'current_subscription_id',
    as: 'currentSubscription',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});

// =====================
// EMPLOYEES
// =====================
Tenant.hasMany(Employee, {
    foreignKey: 'tenant_id',
    as: 'employees',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Employee.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Employee.hasOne(User, {
    foreignKey: 'employee_id',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
User.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee',
    allowNull: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// =====================
// USERS
// =====================


// Relación N:M entre usuarios y roles
User.belongsToMany(Role, {
    through: UserRole,
    as: 'roles',
    foreignKey: 'user_id',
    otherKey: 'role_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Role.belongsToMany(User, {
    through: UserRole,
    as: 'users',
    foreignKey: 'role_id',
    otherKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Relación explícita para el pivote (opcional, útil para include directos)
UserRole.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
UserRole.belongsTo(Role, {
    foreignKey: 'role_id',
    as: 'role',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// =====================
// ROLES & PERMISSIONS
// =====================
Role.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Role.hasMany(Permission, {
    foreignKey: 'role_id',
    as: 'permissions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Permission.belongsTo(Role, {
    foreignKey: 'role_id',
    as: 'role',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Permission.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// =====================
// TENANT MODULES & FEATURES
// =====================
TenantModule.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
TenantFeature.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// =====================
// SUBSCRIPTIONS
// =====================
Subscription.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// =====================
// BWISE DENTAL RELATIONS
// =====================

// REFERRALS
Tenant.hasMany(Referral, {
    foreignKey: 'tenant_id',
    as: 'referrals',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Referral.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// OCCUPATIONS
Tenant.hasMany(Occupation, {
    foreignKey: 'tenant_id',
    as: 'occupations',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Occupation.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// PATIENT TYPES
Tenant.hasMany(PatientType, {
    foreignKey: 'tenant_id',
    as: 'patient_types',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
PatientType.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// PATIENT STATUS
Tenant.hasMany(PatientStatus, {
    foreignKey: 'tenant_id',
    as: 'patient_statuses',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
PatientStatus.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// BRACKET TYPES
Tenant.hasMany(BracketType, {
    foreignKey: 'tenant_id',
    as: 'bracket_types',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
BracketType.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// PATIENT PROFESSIONS
Tenant.hasMany(PatientProfession, {
    foreignKey: 'tenant_id',
    as: 'patient_professions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
PatientProfession.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// PATIENTS
Tenant.hasMany(Patient, {
    foreignKey: 'tenant_id',
    as: 'patients',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Patient.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// RELACIONES OPCIONALES (catálogos)
Patient.belongsTo(Referral, {
    foreignKey: 'referral_id',
    as: 'referral',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});
Patient.belongsTo(Occupation, {
    foreignKey: 'occupation_id',
    as: 'occupation',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});
Patient.belongsTo(PatientStatus, {
    foreignKey: 'patient_status_id',
    as: 'status',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});
Patient.belongsTo(BracketType, {
    foreignKey: 'bracket_type_id',
    as: 'bracket_type',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});
Patient.belongsTo(PatientProfession, {
    foreignKey: 'patient_profession_id',
    as: 'profession',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});

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
Referral.hasMany(Patient, {
    foreignKey: 'referral_id',
    as: 'patients',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});
Occupation.hasMany(Patient, {
    foreignKey: 'occupation_id',
    as: 'patients',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});
PatientStatus.hasMany(Patient, {
    foreignKey: 'patient_status_id',
    as: 'patients',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});
BracketType.hasMany(Patient, {
    foreignKey: 'bracket_type_id',
    as: 'patients',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});
PatientProfession.hasMany(Patient, {
    foreignKey: 'patient_profession_id',
    as: 'patients',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});

// PATIENT ALERTS
Tenant.hasMany(PatientAlert, {
    foreignKey: 'tenant_id',
    as: 'patient_alerts',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
PatientAlert.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Patient.hasMany(PatientAlert, {
    foreignKey: 'patient_id',
    as: 'alerts',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
PatientAlert.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// PATIENT HOBBIES
Tenant.hasMany(PatientHobby, {
    foreignKey: 'tenant_id',
    as: 'patient_hobbies',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
PatientHobby.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Patient.hasMany(PatientHobby, {
    foreignKey: 'patient_id',
    as: 'hobbies',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
PatientHobby.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// PATIENT PRESCRIPTIONS
Tenant.hasMany(PatientPrescription, {
    foreignKey: 'tenant_id',
    as: 'patient_prescriptions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
PatientPrescription.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Patient.hasMany(PatientPrescription, {
    foreignKey: 'patient_id',
    as: 'prescriptions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
PatientPrescription.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// PATIENT NOTES
Tenant.hasMany(PatientNote, {
    foreignKey: 'tenant_id',
    as: 'patient_notes',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientNote.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Patient.hasMany(PatientNote, {
    foreignKey: 'patient_id',
    as: 'notes',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientNote.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
User.hasMany(PatientNote, {
    foreignKey: 'user_id',
    as: 'notes',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientNote.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// PATIENT CONVERSATIONS
Tenant.hasMany(PatientConversation, {
    foreignKey: 'tenant_id',
    as: 'patient_conversations',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientConversation.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Patient.hasMany(PatientConversation, {
    foreignKey: 'patient_id',
    as: 'conversations',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientConversation.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
User.hasMany(PatientConversation, {
    foreignKey: 'user_id',
    as: 'conversations',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientConversation.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// BILLING DATA
Tenant.hasMany(BillingData, {
    foreignKey: 'tenant_id',
    as: 'billing_data',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
BillingData.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Patient.belongsToMany(BillingData, {
    through: PatientBillingData,
    as: 'billing_data',
    foreignKey: 'patient_id',
    otherKey: 'billing_data_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
BillingData.belongsToMany(Patient, {
    through: PatientBillingData,
    as: 'patients',
    foreignKey: 'billing_data_id',
    otherKey: 'patient_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

PatientBillingData.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// PATIENT REPRESENTATIVES
Tenant.hasMany(PatientRepresentative, {
    foreignKey: 'tenant_id',
    as: 'representatives',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
PatientRepresentative.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// N:M Paciente ↔ Representante
Patient.belongsToMany(PatientRepresentative, {
    through: PatientRepresentativeLink,
    as: 'representatives',
    foreignKey: 'patient_id',
    otherKey: 'representative_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
PatientRepresentative.belongsToMany(Patient, {
    through: PatientRepresentativeLink,
    as: 'patients',
    foreignKey: 'representative_id',
    otherKey: 'patient_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Relación directa al pivot
Tenant.hasMany(PatientRepresentativeLink, {
    foreignKey: 'tenant_id',
    as: 'patient_rep_links',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
PatientRepresentativeLink.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// =====================
// PATIENT EXTRACTIONS
// =====================
Tenant.hasMany(PatientExtraction, {
    foreignKey: 'tenant_id',
    as: 'patient_extractions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientExtraction.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Patient.hasMany(PatientExtraction, {
    foreignKey: 'patient_id',
    as: 'extractions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientExtraction.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Extraction Order -> Teeth
PatientExtraction.hasMany(ExtractionTooth, {
    foreignKey: 'patient_extraction_id',
    as: 'teeth',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
ExtractionTooth.belongsTo(PatientExtraction, {
    foreignKey: 'patient_extraction_id',
    as: 'extraction_order',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Extraction Order -> Files
PatientExtraction.hasMany(ExtractionFile, {
    foreignKey: 'patient_extraction_id',
    as: 'files',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
ExtractionFile.belongsTo(PatientExtraction, {
    foreignKey: 'patient_extraction_id',
    as: 'extraction_order',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// =====================
// SERVICES
// =====================
const Service = require('./service.model');

Tenant.hasMany(Service, {
    foreignKey: 'tenant_id',
    as: 'services',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Service.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// =====================
// CLINIC AREAS
// =====================
const ClinicArea = require('./clinic_area.model');

Tenant.hasMany(ClinicArea, {
    foreignKey: 'tenant_id',
    as: 'clinic_areas',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
ClinicArea.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// =====================
// APPOINTMENTS
// =====================
const Appointment = require('./appointment.model');
const AppointmentService = require('./appointment_service.model');
const AppointmentDoctorTime = require('./appointment_doctor_time.model');

// Appointment Relationships
Appointment.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Appointment.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Appointment.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Appointment.belongsTo(ClinicArea, {
    foreignKey: 'clinic_area_id',
    as: 'clinic_area',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Appointment.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});

// Pivot: AppointmentService
Appointment.hasMany(AppointmentService, {
    foreignKey: 'appointment_id',
    as: 'services',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
AppointmentService.belongsTo(Appointment, {
    foreignKey: 'appointment_id',
    as: 'appointment',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
AppointmentService.belongsTo(Service, {
    foreignKey: 'service_id',
    as: 'service',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Doctor Times
Appointment.hasMany(AppointmentDoctorTime, {
    foreignKey: 'appointment_id',
    as: 'doctor_times',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
AppointmentDoctorTime.belongsTo(Appointment, {
    foreignKey: 'appointment_id',
    as: 'appointment',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});


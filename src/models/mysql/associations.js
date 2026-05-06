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
const Odontogram = require('./odontogram.model');
const OdontogramDetalle = require('./odontogram_detalle.model');
const PatientElastic = require('./patient_elastic.model');
const PatientExtractionOrder = require('./patient_extraction_order.model');
const ExtractionOrderTooth = require('./extraction_order_tooth.model');
const ExtractionOrderFile = require('./extraction_order_file.model');
const PatientClinicalRecord = require('./patient_clinical_record.model');
const Position = require('./position.model');
const EmployeePosition = require('./employee_position.model');

const BillingData = require('./billing_data.model');
const PatientBillingData = require('./patient_billing_data.model');

const InventoryProvider = require('./inventory_provider.model');
const InventoryItem = require('./inventory_item.model');
const InventoryMovement = require('./inventory_movement.model');

const PatientRepresentative = require('./patient_representative.model');
const PatientRepresentativeLink = require('./patient_representative_link.model');
const PatientGalleryFolder = require('./patient_gallery_folder.model');
const PatientGalleryImage = require('./patient_gallery_image.model');
const Attendance = require('./attendance.model');
const EmployeeChat = require('./employee_chat.model');
const EmployeeChatParticipant = require('./employee_chat_participant.model');
const ChatMessage = require('./chat_message.model');
const ChatMessageRead = require('./chat_message_read.model');

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

// Relación de rol único
Employee.belongsTo(Role, {
    foreignKey: 'role_id',
    as: 'role',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
});
Role.hasMany(Employee, {
    foreignKey: 'role_id',
    as: 'employees',
});

// Relación N:M con Puestos
Employee.belongsToMany(Position, {
    through: EmployeePosition,
    as: 'positions',
    foreignKey: 'employee_id',
    otherKey: 'position_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Position.belongsToMany(Employee, {
    through: EmployeePosition,
    as: 'employees',
    foreignKey: 'position_id',
    otherKey: 'employee_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Relación explícita con el pivote
EmployeePosition.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
EmployeePosition.belongsTo(Position, { foreignKey: 'position_id', as: 'position' });
Employee.hasMany(EmployeePosition, { foreignKey: 'employee_id', as: 'employee_positions' });
Position.hasMany(EmployeePosition, { foreignKey: 'position_id', as: 'position_employees' });

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

PatientBillingData.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

PatientBillingData.belongsTo(BillingData, {
    foreignKey: 'billing_data_id',
    as: 'billing_data',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Patient.hasMany(PatientBillingData, {
    foreignKey: 'patient_id',
    as: 'patient_billing_links',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

BillingData.hasMany(PatientBillingData, {
    foreignKey: 'billing_data_id',
    as: 'patient_links',
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
// EXTRACTION ORDERS (MIGRATED)
// =====================

Tenant.hasMany(PatientExtractionOrder, {
    foreignKey: 'tenant_id',
    as: 'extractionOrders',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientExtractionOrder.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Patient.hasMany(PatientExtractionOrder, {
    foreignKey: 'patient_id',
    as: 'clinicalExtractionOrders',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientExtractionOrder.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Employee.hasMany(PatientExtractionOrder, {
    foreignKey: 'doctor_id',
    as: 'performedExtractionOrders',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});
PatientExtractionOrder.belongsTo(Employee, {
    foreignKey: 'doctor_id',
    as: 'doctor',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});

PatientExtractionOrder.hasMany(ExtractionOrderTooth, {
    foreignKey: 'extraction_order_id',
    as: 'teeth',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
ExtractionOrderTooth.belongsTo(PatientExtractionOrder, {
    foreignKey: 'extraction_order_id',
    as: 'order',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

PatientExtractionOrder.hasMany(ExtractionOrderFile, {
    foreignKey: 'extraction_order_id',
    as: 'files',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
ExtractionOrderFile.belongsTo(PatientExtractionOrder, {
    foreignKey: 'extraction_order_id',
    as: 'order',
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


// =====================
// PROCESSES & STEPS
// =====================
const Process = require('./process.model');
const Step = require('./step.model');
const ProcessStep = require('./process_step.model');

// Appointment Process Snapshot
// =====================
const AppointmentProcess = require('./appointment_process.model');
const AppointmentProcessStep = require('./appointment_process_step.model');

// Appointment -> AppointmentProcess (One-to-One)
Appointment.hasOne(AppointmentProcess, {
    foreignKey: 'appointment_id',
    as: 'process_snapshot',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
AppointmentProcess.belongsTo(Appointment, {
    foreignKey: 'appointment_id',
    as: 'appointment',
});

// AppointmentProcess -> AppointmentProcessStep (One-to-Many)
AppointmentProcess.hasMany(AppointmentProcessStep, {
    foreignKey: 'appointment_process_id',
    as: 'steps',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
AppointmentProcessStep.belongsTo(AppointmentProcess, {
    foreignKey: 'appointment_process_id',
    as: 'process_snapshot',
});

// Optional references to templates
AppointmentProcess.belongsTo(Process, {
    foreignKey: 'process_id',
    as: 'template_process',
    onDelete: 'SET NULL',
});
AppointmentProcessStep.belongsTo(Step, {
    foreignKey: 'step_id',
    as: 'template_step',
    onDelete: 'SET NULL',
});

// Tenant -> Processes
Tenant.hasMany(Process, {
    foreignKey: 'tenant_id',
    as: 'processes',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});


Process.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Tenant -> Steps
Tenant.hasMany(Step, {
    foreignKey: 'tenant_id',
    as: 'steps',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Step.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Process <-> Step (Many-to-Many via ProcessStep)
Process.belongsToMany(Step, {
    through: ProcessStep,
    as: 'steps',
    foreignKey: 'process_id',
    otherKey: 'step_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Step.belongsToMany(Process, {
    through: ProcessStep,
    as: 'processes',
    foreignKey: 'step_id',
    otherKey: 'process_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Direct relations to Pivot (for explicit editing/access)
Process.hasMany(ProcessStep, {
    foreignKey: 'process_id',
    as: 'process_steps',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
ProcessStep.belongsTo(Process, {
    foreignKey: 'process_id',
    as: 'process',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Step.hasMany(ProcessStep, {
    foreignKey: 'step_id',
    as: 'step_usages',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
ProcessStep.belongsTo(Step, {
    foreignKey: 'step_id',
    as: 'step',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// =====================
// TREATMENT PLANS
// =====================
const TreatmentCatalog = require('./treatment_catalog.model');
const TreatmentPlan = require('./treatment_plan.model');
const TreatmentPlanItem = require('./treatment_plan_item.model');

// Tenant -> TreatmentCatalog
Tenant.hasMany(TreatmentCatalog, {
    foreignKey: 'tenant_id',
    as: 'treatment_catalogs',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
TreatmentCatalog.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Tenant -> TreatmentPlan
Tenant.hasMany(TreatmentPlan, {
    foreignKey: 'tenant_id',
    as: 'treatment_plans',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
TreatmentPlan.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Patient -> TreatmentPlan
Patient.hasMany(TreatmentPlan, {
    foreignKey: 'patient_id',
    as: 'treatment_plans',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
TreatmentPlan.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// TreatmentPlan -> TreatmentPlanItem
TreatmentPlan.hasMany(TreatmentPlanItem, {
    foreignKey: 'treatment_plan_id',
    as: 'items',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
TreatmentPlanItem.belongsTo(TreatmentPlan, {
    foreignKey: 'treatment_plan_id',
    as: 'treatment_plan',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// TreatmentCatalog -> TreatmentPlanItem
TreatmentCatalog.hasMany(TreatmentPlanItem, {
    foreignKey: 'catalog_id',
    as: 'used_in_items',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});
TreatmentPlanItem.belongsTo(TreatmentCatalog, {
    foreignKey: 'catalog_id',
    as: 'catalog_item',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});

// =====================
// BUDGETS
// =====================
const Budget = require('./budget.model');
const BudgetItem = require('./budget_item.model');

// Tenant -> Budget
Tenant.hasMany(Budget, {
    foreignKey: 'tenant_id',
    as: 'budgets',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Budget.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Patient -> Budget
Patient.hasMany(Budget, {
    foreignKey: 'patient_id',
    as: 'budgets',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Budget.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// User -> Budget (Creator)
User.hasMany(Budget, {
    foreignKey: 'created_by',
    as: 'created_budgets',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
Budget.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

// TreatmentPlan -> Budget (Optional)
TreatmentPlan.hasMany(Budget, {
    foreignKey: 'treatment_plan_id',
    as: 'budgets',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});
Budget.belongsTo(TreatmentPlan, {
    foreignKey: 'treatment_plan_id',
    as: 'treatment_plan',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});

// Budget -> BudgetItem (The error fix)
Budget.hasMany(BudgetItem, {
    foreignKey: 'budget_id',
    as: 'items',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
BudgetItem.belongsTo(Budget, {
    foreignKey: 'budget_id',
    as: 'budget',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// =====================
// ODONTOGRAMS
// =====================

// Tenant -> Odontogram
Tenant.hasMany(Odontogram, {
    foreignKey: 'tenant_id',
    as: 'odontograms',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Odontogram.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Patient -> Odontogram
Patient.hasOne(Odontogram, {
    foreignKey: 'patient_id',
    as: 'odontogram',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Odontogram.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Odontogram -> OdontogramDetalle
Odontogram.hasMany(OdontogramDetalle, {
    foreignKey: 'odontogram_id',
    as: 'details',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
OdontogramDetalle.belongsTo(Odontogram, {
    foreignKey: 'odontogram_id',
    as: 'odontogram',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// =====================
// PATIENT ELASTICS
// =====================

Tenant.hasMany(PatientElastic, {
    foreignKey: 'tenant_id',
    as: 'patient_elastics',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientElastic.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Patient.hasMany(PatientElastic, {
    foreignKey: 'patient_id',
    as: 'elastics',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientElastic.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// =====================
// PATIENT GALLERY
// =====================

// Tenant -> Gallery Folder
Tenant.hasMany(PatientGalleryFolder, {
    foreignKey: 'tenant_id',
    as: 'gallery_folders',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientGalleryFolder.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant'
});

// Patient -> Gallery Folder
Patient.hasMany(PatientGalleryFolder, {
    foreignKey: 'patient_id',
    as: 'gallery_folders',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientGalleryFolder.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient'
});

// Folder -> Image
PatientGalleryFolder.hasMany(PatientGalleryImage, {
    foreignKey: 'folder_id',
    as: 'images',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientGalleryImage.belongsTo(PatientGalleryFolder, {
    foreignKey: 'folder_id',
    as: 'folder'
});

// =====================
// PATIENT CLINICAL RECORD
// =====================
Tenant.hasMany(PatientClinicalRecord, {
    foreignKey: 'tenant_id',
    as: 'clinical_records',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientClinicalRecord.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant'
});

Patient.hasOne(PatientClinicalRecord, {
    foreignKey: 'patient_id',
    as: 'clinical_record',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
PatientClinicalRecord.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient'
});

// =====================
// INVENTORY
// =====================

// Inventory Provider
Tenant.hasMany(InventoryProvider, {
    foreignKey: 'tenant_id',
    as: 'inventory_providers',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
InventoryProvider.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant'
});

// Inventory Item
Tenant.hasMany(InventoryItem, {
    foreignKey: 'tenant_id',
    as: 'inventory_items',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
InventoryItem.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant'
});

InventoryProvider.hasMany(InventoryItem, {
    foreignKey: 'provider_id',
    as: 'items',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});
InventoryItem.belongsTo(InventoryProvider, {
    foreignKey: 'provider_id',
    as: 'provider'
});

// Inventory Movement
Tenant.hasMany(InventoryMovement, {
    foreignKey: 'tenant_id',
    as: 'inventory_movements',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
InventoryMovement.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant'
});

InventoryItem.hasMany(InventoryMovement, {
    foreignKey: 'item_id',
    as: 'movements',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
InventoryMovement.belongsTo(InventoryItem, {
    foreignKey: 'item_id',
    as: 'item'
});

InventoryProvider.hasMany(InventoryMovement, {
    foreignKey: 'provider_id',
    as: 'provider_movements',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});
InventoryMovement.belongsTo(InventoryProvider, {
    foreignKey: 'provider_id',
    as: 'provider'
});

// =====================
// ATTENDANCES
// =====================

Tenant.hasMany(Attendance, {
    foreignKey: 'tenant_id',
    as: 'attendances',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Attendance.belongsTo(Tenant, {
    foreignKey: 'tenant_id',
    as: 'tenant',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Employee.hasMany(Attendance, {
    foreignKey: 'employee_id',
    as: 'attendances',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Attendance.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// =============================================================
// RELACIONES PARA EL SISTEMA DE CHAT
// =============================================================

// 1. Relaciones con Tenant (Multitenancy)
Tenant.hasMany(EmployeeChat, { foreignKey: 'tenant_id' });
EmployeeChat.belongsTo(Tenant, { foreignKey: 'tenant_id' });

// 2. Relaciones de EmployeeChat y sus Participantes
EmployeeChat.hasMany(EmployeeChatParticipant, { foreignKey: 'chat_id', as: 'participants' });
EmployeeChatParticipant.belongsTo(EmployeeChat, { foreignKey: 'chat_id' });

User.hasMany(EmployeeChatParticipant, { foreignKey: 'user_id' });
EmployeeChatParticipant.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 3. Relaciones de Mensajes
EmployeeChat.hasMany(ChatMessage, { foreignKey: 'chat_id', as: 'messages' });
ChatMessage.belongsTo(EmployeeChat, { foreignKey: 'chat_id' });

User.hasMany(ChatMessage, { foreignKey: 'sender_id', as: 'sentMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// 4. Relaciones de Lectura de Mensajes
ChatMessage.hasMany(ChatMessageRead, { foreignKey: 'message_id', as: 'reads' });
ChatMessageRead.belongsTo(ChatMessage, { foreignKey: 'message_id' });

User.hasMany(ChatMessageRead, { foreignKey: 'user_id' });
ChatMessageRead.belongsTo(User, { foreignKey: 'user_id' });

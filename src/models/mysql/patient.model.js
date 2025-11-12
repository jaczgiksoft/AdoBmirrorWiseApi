// src/models/mysql/patient.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Patient = sequelize.define('Patient', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // 🏢 Multi-tenant
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },

    // 🆔 Identificadores
    medical_record_number: { type: DataTypes.STRING, allowNull: false },
    family_code: { type: DataTypes.STRING, allowNull: true },

    // 👤 Identidad
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: { type: DataTypes.STRING(100), allowNull: false },
    middle_name: { type: DataTypes.STRING(100), allowNull: true },
    nickname: { type: DataTypes.STRING(100), allowNull: true },

    // 🧬 Información personal
    genre: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: false },
    birth_date: { type: DataTypes.DATEONLY, allowNull: false },
    marital_status: { type: DataTypes.STRING(50), allowNull: true },

    // ☎️ Contacto
    phone_number: { type: DataTypes.STRING(20), allowNull: false },
    email: { type: DataTypes.STRING(120), allowNull: true, validate: { isEmail: true } },

    // 🔗 Relaciones externas
    referral_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'referrals', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    occupation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'occupations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    bracket_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'bracket_types', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    patient_status_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'patient_statuses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    patient_profession_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'patient_professions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },

    // 🏠 Dirección
    address_street_name: { type: DataTypes.STRING(120), allowNull: true },
    address_neighborhood: { type: DataTypes.STRING(120), allowNull: true },
    address_apartment_number: { type: DataTypes.STRING(20), allowNull: true },
    address_street_number: { type: DataTypes.STRING(20), allowNull: true },
    address_zip_code: { type: DataTypes.STRING(10), allowNull: true },
    address_city: { type: DataTypes.STRING(100), allowNull: true },
    address_state: { type: DataTypes.STRING(100), allowNull: true },
    address_country: { type: DataTypes.STRING(100), allowNull: true },

    // 💼 Profesión y empresa
    rfc: { type: DataTypes.STRING(20), allowNull: true },
    company: { type: DataTypes.STRING(120), allowNull: true },
    company_address: { type: DataTypes.STRING(200), allowNull: true },

    // 🖼️ Datos adicionales
    photo_url: { type: DataTypes.STRING, allowNull: true },
    medical_record_image_url: { type: DataTypes.STRING, allowNull: true },

    // 💊 Tratamientos y medicamentos
    is_under_medical_treatment: { type: DataTypes.BOOLEAN, defaultValue: false },
    current_treatment_description: { type: DataTypes.TEXT, allowNull: true },
    is_taking_medication: { type: DataTypes.BOOLEAN, defaultValue: false },
    current_medications: { type: DataTypes.TEXT, allowNull: true },
    is_allergic_to_medication: { type: DataTypes.BOOLEAN, defaultValue: false },
    allergies_description: { type: DataTypes.TEXT, allowNull: true },

    // ⚕️ Condiciones médicas
    has_hepatitis: { type: DataTypes.BOOLEAN, defaultValue: false },
    has_diabetes: { type: DataTypes.BOOLEAN, defaultValue: false },
    has_lung_conditions: { type: DataTypes.BOOLEAN, defaultValue: false },
    has_migraines: { type: DataTypes.BOOLEAN, defaultValue: false },
    has_amigdalitis: { type: DataTypes.BOOLEAN, defaultValue: false },
    has_adenoiditis: { type: DataTypes.BOOLEAN, defaultValue: false },
    has_epilepsy: { type: DataTypes.BOOLEAN, defaultValue: false },
    has_rheumatic_fever: { type: DataTypes.BOOLEAN, defaultValue: false },
    has_psychological_conditions: { type: DataTypes.BOOLEAN, defaultValue: false },
    has_heart_conditions: { type: DataTypes.BOOLEAN, defaultValue: false },
    has_hemophilia: { type: DataTypes.BOOLEAN, defaultValue: false },
    has_stds: { type: DataTypes.BOOLEAN, defaultValue: false },

    // 🤰 Embarazo
    is_pregnant: { type: DataTypes.BOOLEAN, defaultValue: false },
    pregnancy_weeks: { type: DataTypes.INTEGER, allowNull: true },

    // 🗓️ Fechas clínicas
    last_radiograph_date: { type: DataTypes.DATEONLY, allowNull: true },
    last_dental_exam_date: { type: DataTypes.DATEONLY, allowNull: true },

    // 🦷 Hábitos orales
    has_received_fluoride: { type: DataTypes.BOOLEAN, defaultValue: false },
    fluoride_date_description: { type: DataTypes.STRING, allowNull: true },
    has_bleeding_gums: { type: DataTypes.BOOLEAN, defaultValue: false },
    has_oral_habits: { type: DataTypes.BOOLEAN, defaultValue: false },
    chews_on_both_sides: { type: DataTypes.BOOLEAN, defaultValue: false },
    has_jaw_pain_or_noise: { type: DataTypes.BOOLEAN, defaultValue: false },
    grinds_teeth: { type: DataTypes.BOOLEAN, defaultValue: false },
    breathes_through_mouth: { type: DataTypes.BOOLEAN, defaultValue: false },
    had_previous_orthodontics: { type: DataTypes.BOOLEAN, defaultValue: false },

    // 🔐 Portal del paciente
    username: { type: DataTypes.STRING, allowNull: true, unique: true },
    password: { type: DataTypes.STRING, allowNull: true },
    can_login: { type: DataTypes.BOOLEAN, defaultValue: false },
    push_token: { type: DataTypes.STRING, allowNull: true },
    first_login: { type: DataTypes.BOOLEAN, defaultValue: true }

}, {
    tableName: 'patients',
    timestamps: true,
    paranoid: true,
    underscored: true,

    indexes: [
        { fields: ['tenant_id'], name: 'idx_patients_tenant' },
        { fields: ['first_name'], name: 'idx_patients_first_name' },
        { fields: ['last_name'], name: 'idx_patients_last_name' },
        { fields: ['email'], name: 'idx_patients_email' },
        { fields: ['phone_number'], name: 'idx_patients_phone' },
        {
            unique: true,
            fields: ['tenant_id', 'medical_record_number'],
            name: 'uq_patients_tenant_medical_record'
        }
    ]
});

module.exports = Patient;

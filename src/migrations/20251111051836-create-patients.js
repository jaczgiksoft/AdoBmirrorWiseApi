'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patients', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      // 🏢 Multi-tenant
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      // 🆔 Identificadores
      medical_record_number: { type: Sequelize.STRING, allowNull: false, unique: true },
      family_code: { type: Sequelize.STRING, allowNull: true },

      // 👤 Identidad
      first_name: { type: Sequelize.STRING(100), allowNull: false },
      last_name: { type: Sequelize.STRING(100), allowNull: false },
      middle_name: { type: Sequelize.STRING(100), allowNull: true },
      nickname: { type: Sequelize.STRING(100), allowNull: true },

      // 🧬 Información personal
      genre: { type: Sequelize.ENUM('male', 'female', 'other'), allowNull: false },
      birth_date: { type: Sequelize.DATEONLY, allowNull: false },
      marital_status: { type: Sequelize.STRING(50), allowNull: true },

      // ☎️ Contacto
      phone_number: { type: Sequelize.STRING(20), allowNull: false },
      email: { type: Sequelize.STRING(120), allowNull: true },

      // 🔗 Relaciones externas
      referral_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'referrals', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      occupation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'occupations', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      bracket_type_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'bracket_types', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      patient_type_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'patient_types', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      patient_status_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'patient_statuses', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      patient_profession_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'patient_professions', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },

      // 🏠 Dirección
      address_street_name: { type: Sequelize.STRING(120), allowNull: true },
      address_neighborhood: { type: Sequelize.STRING(120), allowNull: true },
      address_apartment_number: { type: Sequelize.STRING(20), allowNull: true },
      address_street_number: { type: Sequelize.STRING(20), allowNull: true },
      address_zip_code: { type: Sequelize.STRING(10), allowNull: true },
      address_city: { type: Sequelize.STRING(100), allowNull: true },
      address_state: { type: Sequelize.STRING(100), allowNull: true },
      address_country: { type: Sequelize.STRING(100), allowNull: true },

      // 💼 Profesión y empresa
      rfc: { type: Sequelize.STRING(20), allowNull: true },
      company: { type: Sequelize.STRING(120), allowNull: true },
      company_address: { type: Sequelize.STRING(200), allowNull: true },

      // 🖼️ Datos adicionales
      photo_url: { type: Sequelize.STRING, allowNull: true },
      medical_record_image_url: { type: Sequelize.STRING, allowNull: true },

      // 💊 Tratamientos y medicamentos
      is_under_medical_treatment: { type: Sequelize.BOOLEAN, defaultValue: false },
      current_treatment_description: { type: Sequelize.TEXT, allowNull: true },

      is_taking_medication: { type: Sequelize.BOOLEAN, defaultValue: false },
      current_medications: { type: Sequelize.TEXT, allowNull: true },

      is_allergic_to_medication: { type: Sequelize.BOOLEAN, defaultValue: false },
      allergies_description: { type: Sequelize.TEXT, allowNull: true },

      // ⚕️ Condiciones médicas
      has_hepatitis: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_diabetes: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_lung_conditions: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_migraines: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_amigdalitis: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_adenoiditis: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_epilepsy: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_rheumatic_fever: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_psychological_conditions: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_heart_conditions: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_hemophilia: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_stds: { type: Sequelize.BOOLEAN, defaultValue: false },

      // 🤰 Embarazo
      is_pregnant: { type: Sequelize.BOOLEAN, defaultValue: false },
      pregnancy_weeks: { type: Sequelize.INTEGER, allowNull: true },

      // 🗓️ Fechas
      last_radiograph_date: { type: Sequelize.DATEONLY, allowNull: true },
      last_dental_exam_date: { type: Sequelize.DATEONLY, allowNull: true },

      // 🦷 Fluoruro y hábitos orales
      has_received_fluoride: { type: Sequelize.BOOLEAN, defaultValue: false },
      fluoride_date_description: { type: Sequelize.STRING, allowNull: true },

      has_bleeding_gums: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_oral_habits: { type: Sequelize.BOOLEAN, defaultValue: false },
      chews_on_both_sides: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_jaw_pain_or_noise: { type: Sequelize.BOOLEAN, defaultValue: false },
      grinds_teeth: { type: Sequelize.BOOLEAN, defaultValue: false },
      breathes_through_mouth: { type: Sequelize.BOOLEAN, defaultValue: false },
      had_previous_orthodontics: { type: Sequelize.BOOLEAN, defaultValue: false },

      // 🔐 Portal del paciente
      username: { type: Sequelize.STRING, allowNull: true, unique: true },
      password: { type: Sequelize.STRING, allowNull: true },
      can_login: { type: Sequelize.BOOLEAN, defaultValue: false },
      push_token: { type: Sequelize.STRING, allowNull: true },
      first_login: { type: Sequelize.BOOLEAN, defaultValue: true },

      // 🕒 Sequelize timestamps (camelCase)
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      deletedAt: { type: Sequelize.DATE, allowNull: true }
    });

    // Índices recomendados
    await queryInterface.addIndex('patients', ['tenant_id'], { name: 'patients_tenant_idx' });
    await queryInterface.addIndex('patients', ['medical_record_number'], { name: 'patients_record_idx' });
    await queryInterface.addIndex('patients', ['first_name', 'last_name'], { name: 'patients_name_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('patients');
  }
};

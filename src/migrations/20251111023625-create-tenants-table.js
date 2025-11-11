'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tenants', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      // 🏷️ Identidad principal
      code: {
        type: Sequelize.STRING(8),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      logo_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },

      // 📞 Contacto
      contact_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contact_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contact_phone: {
        type: Sequelize.STRING,
        allowNull: true
      },

      // 🏠 Dirección
      address: { type: Sequelize.STRING, allowNull: true },
      city: { type: Sequelize.STRING, allowNull: true },
      state: { type: Sequelize.STRING, allowNull: true },
      country: { type: Sequelize.STRING, allowNull: true },
      postal_code: { type: Sequelize.STRING, allowNull: true },

      // 🧾 Datos fiscales
      tax_id: { type: Sequelize.STRING, allowNull: true },
      legal_name: { type: Sequelize.STRING, allowNull: true },
      regime: { type: Sequelize.STRING, allowNull: true },
      certificate_path: { type: Sequelize.STRING, allowNull: true },
      key_path: { type: Sequelize.STRING, allowNull: true },
      certificate_password: { type: Sequelize.STRING, allowNull: true },
      cfdi_use: { type: Sequelize.STRING, allowNull: true },
      payment_method: { type: Sequelize.STRING, allowNull: true },
      payment_form: { type: Sequelize.STRING, allowNull: true },
      tax_rate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 16.00
      },

      // ⚕️ Registro sanitario COFEPRIS
      health_registration: {
        type: Sequelize.STRING,
        allowNull: true
      },
      health_registration_expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      // ⚙️ Configuración y estado
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'active'
      },
      current_subscription_id: { type: Sequelize.INTEGER, allowNull: true },
      max_users: { type: Sequelize.INTEGER, defaultValue: 5 },
      current_users: { type: Sequelize.INTEGER, defaultValue: 0 },

      // 🌐 Configuración regional y monetaria
      timezone: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'America/Hermosillo'
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'MXN'
      },
      exchange_rate: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true
      },
      profit_margin: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 30.00
      },

      // 🕓 Horarios y clínica
      opening_hours: {
        type: Sequelize.JSON,
        allowNull: true
      },
      specialties: {
        type: Sequelize.JSON,
        allowNull: true
      },
      number_of_rooms: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

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
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
    await queryInterface.addIndex('tenants', ['name'], {
      unique: true,
      name: 'tenants_name_idx'
    });
    await queryInterface.addIndex('tenants', ['code'], {
      unique: true,
      name: 'tenants_code_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tenants');
  }
};

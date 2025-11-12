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
            description: { type: Sequelize.STRING, allowNull: true },
            logo_url: { type: Sequelize.STRING, allowNull: true },
            website: { type: Sequelize.STRING, allowNull: true },

            // 📞 Contacto
            contact_name: { type: Sequelize.STRING, allowNull: true },
            contact_email: { type: Sequelize.STRING, allowNull: true },
            contact_phone: { type: Sequelize.STRING, allowNull: true },

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
            health_registration: { type: Sequelize.STRING, allowNull: true },
            health_registration_expires_at: { type: Sequelize.DATE, allowNull: true },

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
            currency: { type: Sequelize.STRING, defaultValue: 'MXN' },
            exchange_rate: { type: Sequelize.DECIMAL(10, 4), allowNull: true },
            profit_margin: {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: false,
                defaultValue: 30.00
            },

            // 🕓 Horarios y clínica
            opening_hours: { type: Sequelize.JSON, allowNull: true },
            specialties: { type: Sequelize.JSON, allowNull: true },
            number_of_rooms: { type: Sequelize.INTEGER, allowNull: true },

            // 🕒 Sequelize timestamps (snake_case)
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });

        // =====================
        // 📊 Índices optimizados
        // =====================

        // Únicos
        await queryInterface.addIndex('tenants', ['code'], {
            unique: true,
            name: 'idx_tenants_code'
        });
        await queryInterface.addIndex('tenants', ['name'], {
            unique: true,
            name: 'idx_tenants_name'
        });

        // Operativos (consultas frecuentes)
        await queryInterface.addIndex('tenants', ['status'], {
            name: 'idx_tenants_status'
        });
        await queryInterface.addIndex('tenants', ['city'], {
            name: 'idx_tenants_city'
        });
        await queryInterface.addIndex('tenants', ['country'], {
            name: 'idx_tenants_country'
        });
        await queryInterface.addIndex('tenants', ['current_subscription_id'], {
            name: 'idx_tenants_subscription'
        });
    },

    async down(queryInterface, Sequelize) {
        // Borrar ENUMs primero (por compatibilidad en rollback)
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tenants_status";');
        await queryInterface.dropTable('tenants');
    }
};

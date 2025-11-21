'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('billing_data', {
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
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            // 📄 Datos fiscales
            business_name: { type: Sequelize.STRING(150), allowNull: false },
            rfc: { type: Sequelize.STRING(20), allowNull: false },
            tax_regime: { type: Sequelize.STRING(50), allowNull: false },
            zip_code: { type: Sequelize.STRING(10), allowNull: false },
            email: { type: Sequelize.STRING(120), allowNull: true },

            // ⚙️ Control
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },

            // 🕒 timestamps
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
                type: Sequelize.DATE
            }
        });

        // 📊 Índices
        await queryInterface.addIndex('billing_data', ['tenant_id'], { name: 'idx_billing_tenant' });
        await queryInterface.addIndex('billing_data', ['rfc'], { name: 'idx_billing_rfc' });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('billing_data');
    }
};

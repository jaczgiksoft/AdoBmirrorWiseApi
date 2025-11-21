'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('patient_representatives', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },

            tenant_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'tenants', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            full_name: { type: Sequelize.STRING(150), allowNull: false },
            relationship: { type: Sequelize.STRING(50) },
            phone: { type: Sequelize.STRING(20) },
            phone_alt: { type: Sequelize.STRING(20) },
            email: { type: Sequelize.STRING(120) },
            address: { type: Sequelize.STRING(255) },

            username: { type: Sequelize.STRING(50), allowNull: true },
            password: { type: Sequelize.STRING(255), allowNull: true },
            can_login: { type: Sequelize.BOOLEAN, defaultValue: false },
            first_login: { type: Sequelize.BOOLEAN, defaultValue: true },
            last_login_at: { type: Sequelize.DATE },

            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },

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

        // Índices
        await queryInterface.addIndex('patient_representatives', ['tenant_id'], { name: 'idx_representatives_tenant' });
        await queryInterface.addIndex('patient_representatives', ['email'], { name: 'idx_representatives_email' });
        await queryInterface.addIndex('patient_representatives', ['username'], { name: 'idx_representatives_username' });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('patient_representatives');
    }
};

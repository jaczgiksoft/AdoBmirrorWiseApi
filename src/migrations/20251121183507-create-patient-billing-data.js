'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('patient_billing_data', {
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

            patient_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'patients', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            billing_data_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'billing_data', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            is_primary: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },

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
        await queryInterface.addIndex('patient_billing_data', ['tenant_id'], { name: 'idx_patient_billing_tenant' });
        await queryInterface.addIndex('patient_billing_data', ['patient_id'], { name: 'idx_patient_billing_patient' });
        await queryInterface.addIndex('patient_billing_data', ['billing_data_id'], { name: 'idx_patient_billing_billing' });

        await queryInterface.addConstraint('patient_billing_data', {
            fields: ['tenant_id', 'patient_id', 'billing_data_id'],
            type: 'unique',
            name: 'uq_patient_billing_unique'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('patient_billing_data');
    }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('patient_representative_links', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },

            tenant_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: { tableName: 'tenants' }, key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            patient_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: { tableName: 'patients' }, key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            representative_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: { tableName: 'patient_representatives' }, key: 'id' },
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
        await queryInterface.addIndex('patient_representative_links', ['tenant_id'], { name: 'idx_rep_link_tenant' });
        await queryInterface.addIndex('patient_representative_links', ['patient_id'], { name: 'idx_rep_link_patient' });
        await queryInterface.addIndex('patient_representative_links', ['representative_id'], { name: 'idx_rep_link_representative' });

        await queryInterface.addConstraint('patient_representative_links', {
            fields: ['tenant_id', 'patient_id', 'representative_id'],
            type: 'unique',
            name: 'uq_rep_link_unique'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('patient_representative_links');
    }
};

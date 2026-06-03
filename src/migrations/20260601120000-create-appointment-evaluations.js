'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('appointment_evaluations', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            tenant_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'tenants', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },

            appointment_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'appointments', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                unique: true,
            },

            patient_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'patients', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },

            employee_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'employees', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },

            oral_hygiene: {
                type: Sequelize.TINYINT,
                allowNull: true,
            },

            appliance_care: {
                type: Sequelize.TINYINT,
                allowNull: true,
            },

            elastic_usage: {
                type: Sequelize.TINYINT,
                allowNull: true,
            },

            treatment_progress: {
                type: Sequelize.TINYINT,
                allowNull: true,
            },

            comments: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            created_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },

            updated_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },
        });

        await queryInterface.addIndex('appointment_evaluations', ['tenant_id'], {
            name: 'idx_app_eval_tenant',
        });

        await queryInterface.addIndex('appointment_evaluations', ['patient_id'], {
            name: 'idx_app_eval_patient',
        });

        await queryInterface.addIndex('appointment_evaluations', ['employee_id'], {
            name: 'idx_app_eval_employee',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('appointment_evaluations');
    },
};

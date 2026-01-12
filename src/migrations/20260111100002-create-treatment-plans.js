'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('treatment_plans', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            tenant_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'tenants',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            patient_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'patients',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            title: {
                type: Sequelize.STRING(150),
                allowNull: false,
            },
            start_date: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            duration_months: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            is_main: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            status: {
                type: Sequelize.STRING(50),
                defaultValue: 'planned', // planned, active, completed
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
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });

        await queryInterface.addIndex('treatment_plans', ['tenant_id'], {
            name: 'idx_treatment_plans_tenant',
        });
        await queryInterface.addIndex('treatment_plans', ['patient_id'], {
            name: 'idx_treatment_plans_patient',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('treatment_plans');
    },
};

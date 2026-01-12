'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('budgets', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            tenant_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'tenants',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            patient_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'patients',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            treatment_plan_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'treatment_plans',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            created_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            title: {
                type: Sequelize.STRING(150),
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('pending', 'approved', 'rejected'),
                defaultValue: 'pending',
                allowNull: false
            },
            start_date: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            duration_months: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            total: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            down_payment_type: {
                type: Sequelize.ENUM('percentage', 'fixed'),
                allowNull: true
            },
            down_payment_value: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.00
            },
            down_payment_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.00
            },
            discount_type: {
                type: Sequelize.ENUM('percentage', 'fixed'),
                allowNull: true
            },
            discount_value: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.00
            },
            discount_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.00
            },
            subtotal: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            monthly_payment: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            deleted_at: {
                allowNull: true,
                type: Sequelize.DATE
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('budgets');
    }
};

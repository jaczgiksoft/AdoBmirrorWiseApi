'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('treatment_plan_items', {
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
            treatment_plan_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'treatment_plans',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            catalog_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'treatment_catalogs',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            title: {
                type: Sequelize.STRING(150),
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            color: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            order_index: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
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

        await queryInterface.addIndex('treatment_plan_items', ['tenant_id'], {
            name: 'idx_treatment_plan_items_tenant',
        });
        await queryInterface.addIndex('treatment_plan_items', ['treatment_plan_id'], {
            name: 'idx_treatment_plan_items_plan',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('treatment_plan_items');
    },
};

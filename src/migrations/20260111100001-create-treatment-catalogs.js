'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('treatment_catalogs', {
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

        await queryInterface.addIndex('treatment_catalogs', ['tenant_id'], {
            name: 'idx_treatment_catalogs_tenant',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('treatment_catalogs');
    },
};

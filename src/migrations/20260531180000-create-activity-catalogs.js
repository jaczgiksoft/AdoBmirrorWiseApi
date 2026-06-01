'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('activity_catalogs', {
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

            name: {
                type: Sequelize.STRING(200),
                allowNull: false,
            },

            is_custom: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },

            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
                allowNull: false,
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

        await queryInterface.addIndex('activity_catalogs', ['tenant_id'], {
            name: 'idx_activity_catalogs_tenant',
        });

        await queryInterface.addIndex('activity_catalogs', ['tenant_id', 'is_active'], {
            name: 'idx_activity_catalogs_tenant_active',
        });

        await queryInterface.addIndex('activity_catalogs', ['tenant_id', 'name'], {
            name: 'idx_activity_catalogs_tenant_name',
            unique: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('activity_catalogs');
    },
};

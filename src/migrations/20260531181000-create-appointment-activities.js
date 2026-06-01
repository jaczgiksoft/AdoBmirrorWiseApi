'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('appointment_activities', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            appointment_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'appointments', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },

            activity_catalog_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'activity_catalogs', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },

            activity_name: {
                type: Sequelize.STRING(200),
                allowNull: true,
            },

            tenant_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'tenants', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
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

        await queryInterface.addIndex('appointment_activities', ['appointment_id'], {
            name: 'idx_app_act_appointment',
        });

        await queryInterface.addIndex('appointment_activities', ['activity_catalog_id'], {
            name: 'idx_app_act_catalog',
        });

        await queryInterface.addIndex('appointment_activities', ['tenant_id'], {
            name: 'idx_app_act_tenant',
        });

        await queryInterface.addIndex('appointment_activities', ['appointment_id', 'activity_catalog_id'], {
            name: 'idx_app_act_appointment_catalog',
            unique: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('appointment_activities');
    },
};

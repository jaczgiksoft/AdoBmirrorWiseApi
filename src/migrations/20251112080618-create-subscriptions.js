'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('subscriptions', {
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

            plan_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            start_date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },

            end_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },

            max_users: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            price_monthly: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },

            extra_user_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },

            status: {
                type: Sequelize.ENUM('active', 'expired', 'canceled'),
                allowNull: false,
                defaultValue: 'active',
            },

            // 🕒 Sequelize timestamps (snake_case)
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

        // =====================
        // 📊 Índices optimizados
        // =====================

        // Relacional (por tenant)
        await queryInterface.addIndex('subscriptions', ['tenant_id'], {
            name: 'idx_subscriptions_tenant',
        });

        // Búsquedas por estado o expiración
        await queryInterface.addIndex('subscriptions', ['status'], {
            name: 'idx_subscriptions_status',
        });

        await queryInterface.addIndex('subscriptions', ['end_date'], {
            name: 'idx_subscriptions_end_date',
        });

        // Planes (útil para estadísticas de planes)
        await queryInterface.addIndex('subscriptions', ['plan_name'], {
            name: 'idx_subscriptions_plan_name',
        });
    },

    async down(queryInterface, Sequelize) {
        // Borrar ENUM antes del rollback
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_subscriptions_status";');
        await queryInterface.dropTable('subscriptions');
    },
};

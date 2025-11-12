'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('tenant_features', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
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

            feature: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: 'Nombre de la funcionalidad o submódulo habilitado para el tenant'
            },

            is_enabled: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                comment: 'Indica si la funcionalidad está activa para este tenant'
            },

            // 🕒 Sequelize timestamps
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
                type: Sequelize.DATE,
                allowNull: true
            }
        });

        // =====================
        // 📊 Índices optimizados
        // =====================

        // Por tenant
        await queryInterface.addIndex('tenant_features', ['tenant_id'], {
            name: 'idx_tenant_features_tenant'
        });

        // Por nombre de feature
        await queryInterface.addIndex('tenant_features', ['feature'], {
            name: 'idx_tenant_features_feature'
        });

        // Unicidad: feature única por tenant
        await queryInterface.addConstraint('tenant_features', {
            fields: ['tenant_id', 'feature'],
            type: 'unique',
            name: 'uq_tenant_features_tenant_feature'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('tenant_features');
    }
};

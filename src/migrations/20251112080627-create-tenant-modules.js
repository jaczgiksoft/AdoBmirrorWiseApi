'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('tenant_modules', {
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

            module: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: 'Nombre del módulo, ej: users, hr, cctv'
            },

            is_enabled: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'Define si el módulo está activo para el tenant'
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
        await queryInterface.addIndex('tenant_modules', ['tenant_id'], {
            name: 'idx_tenant_modules_tenant'
        });

        // Por nombre del módulo
        await queryInterface.addIndex('tenant_modules', ['module'], {
            name: 'idx_tenant_modules_module'
        });

        // Unicidad: módulo único por tenant
        await queryInterface.addConstraint('tenant_modules', {
            fields: ['tenant_id', 'module'],
            type: 'unique',
            name: 'uq_tenant_modules_tenant_module'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('tenant_modules');
    }
};

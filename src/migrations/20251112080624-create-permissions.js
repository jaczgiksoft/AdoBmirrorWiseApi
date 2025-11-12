'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('permissions', {
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

            role_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'roles',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            module: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: 'Identificador del módulo (ej: patients, billing, users)'
            },

            can_read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            can_write: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            can_edit: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            can_delete: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        });

        // =====================
        // 📊 Índices optimizados
        // =====================

        // Índice por tenant
        await queryInterface.addIndex('permissions', ['tenant_id'], {
            name: 'idx_permissions_tenant'
        });

        // Índice por rol
        await queryInterface.addIndex('permissions', ['role_id'], {
            name: 'idx_permissions_role'
        });

        // Índice por módulo
        await queryInterface.addIndex('permissions', ['module'], {
            name: 'idx_permissions_module'
        });

        // Evitar duplicados por rol + módulo
        await queryInterface.addConstraint('permissions', {
            fields: ['role_id', 'module'],
            type: 'unique',
            name: 'uq_permissions_role_module'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('permissions');
    }
};

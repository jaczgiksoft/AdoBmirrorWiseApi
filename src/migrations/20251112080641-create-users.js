'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
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

            employee_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'employees',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },

            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                comment: 'Correo de acceso al sistema'
            },

            password: {
                type: Sequelize.STRING,
                allowNull: false
            },

            username: {
                type: Sequelize.STRING,
                allowNull: false
            },

            is_superadmin: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },

            status: {
                type: Sequelize.ENUM('active', 'inactive', 'blocked'),
                allowNull: false,
                defaultValue: 'active'
            },

            last_login_at: {
                type: Sequelize.DATE,
                allowNull: true
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

        // Tenant
        await queryInterface.addIndex('users', ['tenant_id'], {
            name: 'idx_users_tenant'
        });

        // Employee
        await queryInterface.addIndex('users', ['employee_id'], {
            name: 'idx_users_employee'
        });

        // Status
        await queryInterface.addIndex('users', ['status'], {
            name: 'idx_users_status'
        });

        // Email (único)
        await queryInterface.addConstraint('users', {
            fields: ['email'],
            type: 'unique',
            name: 'uq_users_email'
        });
    },

    async down(queryInterface, Sequelize) {
        // Eliminar ENUM antes de rollback
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_status";');
        await queryInterface.dropTable('users');
    }
};

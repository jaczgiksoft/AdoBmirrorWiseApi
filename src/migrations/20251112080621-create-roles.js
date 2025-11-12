'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('roles', {
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

            name: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: 'Nombre del rol, ej: admin, doctor, recepcionista'
            },

            requires_cash_session: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'Si este rol debe iniciar una sesión de caja al entrar al POS'
            },

            // 🕒 Sequelize timestamps (snake_case)
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

        // Índice por tenant
        await queryInterface.addIndex('roles', ['tenant_id'], {
            name: 'idx_roles_tenant'
        });

        // Único (tenant_id + name) para evitar duplicados dentro del mismo tenant
        await queryInterface.addConstraint('roles', {
            fields: ['tenant_id', 'name'],
            type: 'unique',
            name: 'uq_roles_tenant_name'
        });

        // Índice por campo de control POS
        await queryInterface.addIndex('roles', ['requires_cash_session'], {
            name: 'idx_roles_cash_session'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('roles');
    }
};

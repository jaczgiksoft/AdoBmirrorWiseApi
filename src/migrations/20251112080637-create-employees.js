'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('employees', {
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

            first_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            last_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            second_last_name: {
                type: Sequelize.STRING,
                allowNull: true
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: true
            },
            email: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Puede o no coincidir con la cuenta de usuario asociada'
            },
            position: {
                type: Sequelize.STRING,
                allowNull: true
            },
            profile_image: {
                type: Sequelize.STRING,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive'),
                allowNull: false,
                defaultValue: 'active'
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
        await queryInterface.addIndex('employees', ['tenant_id'], {
            name: 'idx_employees_tenant'
        });

        // Estado
        await queryInterface.addIndex('employees', ['status'], {
            name: 'idx_employees_status'
        });

        // Email (para búsqueda rápida)
        await queryInterface.addIndex('employees', ['email'], {
            name: 'idx_employees_email'
        });

        // Evitar duplicados dentro del mismo tenant
        await queryInterface.addConstraint('employees', {
            fields: ['tenant_id', 'email'],
            type: 'unique',
            name: 'uq_employees_tenant_email'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('employees');
    }
};

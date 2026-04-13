'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('positions', {
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
                type: Sequelize.STRING(120),
                allowNull: false,
                comment: 'Nombre del puesto de trabajo'
            },

            description: {
                type: Sequelize.STRING(255),
                allowNull: true,
                comment: 'Descripción de funciones del puesto'
            },

            color: {
                type: Sequelize.STRING(20),
                allowNull: true,
                defaultValue: '#6366f1',
                comment: 'Color identificador para la UI'
            },

            is_appointment_eligible: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'Si el puesto puede recibir citas agendadas'
            },

            status: {
                type: Sequelize.ENUM('active', 'inactive'),
                allowNull: false,
                defaultValue: 'active'
            },

            // 🕒 timestamps
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

        await queryInterface.addIndex('positions', ['tenant_id'], {
            name: 'idx_positions_tenant'
        });

        await queryInterface.addIndex('positions', ['name'], {
            name: 'idx_positions_name'
        });

        await queryInterface.addConstraint('positions', {
            fields: ['tenant_id', 'name'],
            type: 'unique',
            name: 'uq_positions_tenant_name'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('positions');
    }
};

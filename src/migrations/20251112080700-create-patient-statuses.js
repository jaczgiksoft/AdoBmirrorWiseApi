'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('patient_statuses', {
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
                type: Sequelize.STRING(100),
                allowNull: false,
                comment: 'Nombre de la fase clínica (ej. Diagnóstico, Fase I, Retenedor, etc.)'
            },

            description: {
                type: Sequelize.STRING(255),
                allowNull: true,
                comment: 'Descripción breve de la fase o condición del paciente'
            },

            color: {
                type: Sequelize.STRING(10),
                allowNull: true,
                defaultValue: '#CCCCCC',
                comment: 'Color distintivo para UI'
            },

            order_index: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'Orden de visualización en la lista de fases'
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

        await queryInterface.addIndex('patient_statuses', ['tenant_id'], {
            name: 'idx_patient_statuses_tenant'
        });

        await queryInterface.addIndex('patient_statuses', ['name'], {
            name: 'idx_patient_statuses_name'
        });

        await queryInterface.addIndex('patient_statuses', ['order_index'], {
            name: 'idx_patient_statuses_order'
        });

        await queryInterface.addConstraint('patient_statuses', {
            fields: ['tenant_id', 'name'],
            type: 'unique',
            name: 'uq_patient_statuses_tenant_name'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('patient_statuses');
    }
};

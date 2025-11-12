'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('patient_types', {
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
                comment: 'Nombre del tipo de paciente (ej. Nuevo, Control, Referido)'
            },

            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Descripción o propósito del tipo de paciente'
            },

            color: {
                type: Sequelize.STRING(10),
                allowNull: true,
                defaultValue: '#CCCCCC',
                comment: 'Color distintivo para UI'
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

        await queryInterface.addIndex('patient_types', ['tenant_id'], {
            name: 'idx_patient_types_tenant'
        });

        await queryInterface.addIndex('patient_types', ['name'], {
            name: 'idx_patient_types_name'
        });

        await queryInterface.addConstraint('patient_types', {
            fields: ['tenant_id', 'name'],
            type: 'unique',
            name: 'uq_patient_types_tenant_name'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('patient_types');
    }
};

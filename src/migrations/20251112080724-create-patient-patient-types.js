'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('patient_patient_types', {
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

            patient_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'patients',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            patient_type_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'patient_types',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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

        await queryInterface.addIndex('patient_patient_types', ['tenant_id'], {
            name: 'idx_patient_patient_types_tenant'
        });

        await queryInterface.addIndex('patient_patient_types', ['patient_id'], {
            name: 'idx_patient_patient_types_patient'
        });

        await queryInterface.addIndex('patient_patient_types', ['patient_type_id'], {
            name: 'idx_patient_patient_types_type'
        });

        // Evitar duplicados: misma relación paciente-tipo
        await queryInterface.addConstraint('patient_patient_types', {
            fields: ['patient_id', 'patient_type_id'],
            type: 'unique',
            name: 'uq_patient_patient_types_pair'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('patient_patient_types');
    }
};

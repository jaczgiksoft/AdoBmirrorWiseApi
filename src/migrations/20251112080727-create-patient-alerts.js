'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('patient_alerts', {
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

            title: {
                type: Sequelize.STRING(150),
                allowNull: false,
                comment: 'Título o motivo de la alerta (ej. Alergia a penicilina)'
            },

            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },

            is_admin_alert: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'True = alerta administrativa, False = alerta clínica'
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
            }
        });

        // =====================
        // 📊 Índices optimizados
        // =====================

        await queryInterface.addIndex('patient_alerts', ['tenant_id'], {
            name: 'idx_patient_alerts_tenant'
        });

        await queryInterface.addIndex('patient_alerts', ['patient_id'], {
            name: 'idx_patient_alerts_patient'
        });

        await queryInterface.addIndex('patient_alerts', ['is_admin_alert'], {
            name: 'idx_patient_alerts_admin'
        });

        // Evitar duplicados: misma alerta (título) para el mismo paciente
        await queryInterface.addConstraint('patient_alerts', {
            fields: ['tenant_id', 'patient_id', 'title'],
            type: 'unique',
            name: 'uq_patient_alerts_unique_title_per_patient'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('patient_alerts');
    }
};

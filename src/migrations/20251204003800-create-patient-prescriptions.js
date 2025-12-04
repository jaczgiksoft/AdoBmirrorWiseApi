'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('patient_prescriptions', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            // 🏢 Multi-tenant
            tenant_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'tenants',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },

            // 👤 Paciente asociado
            patient_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'patients',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },

            // 🎯 Título de la prescripción
            title: {
                type: Sequelize.STRING(150),
                allowNull: false,
                comment: 'Título de la prescripción',
            },

            // 📝 Contenido de la prescripción
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
                comment: 'Contenido detallado de la prescripción',
            },

            // 🕒 timestamps
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },
        });

        // =====================
        // 📊 Índices optimizados
        // =====================

        await queryInterface.addIndex('patient_prescriptions', ['tenant_id'], {
            name: 'idx_patient_prescriptions_tenant',
        });

        await queryInterface.addIndex('patient_prescriptions', ['patient_id'], {
            name: 'idx_patient_prescriptions_patient',
        });

        // Evitar duplicados: misma prescripción (título) por paciente
        await queryInterface.addConstraint('patient_prescriptions', {
            fields: ['tenant_id', 'patient_id', 'title'],
            type: 'unique',
            name: 'uq_patient_prescriptions_unique_per_patient',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('patient_prescriptions');
    },
};

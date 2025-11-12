'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('patient_hobbies', {
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

            // 🎯 Nombre del pasatiempo
            name: {
                type: Sequelize.STRING(100),
                allowNull: false,
                comment: 'Ej: Fútbol, Pintar, Leer, Tocar guitarra',
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

        await queryInterface.addIndex('patient_hobbies', ['tenant_id'], {
            name: 'idx_patient_hobbies_tenant',
        });

        await queryInterface.addIndex('patient_hobbies', ['patient_id'], {
            name: 'idx_patient_hobbies_patient',
        });

        // Evitar duplicados: mismo hobby por paciente
        await queryInterface.addConstraint('patient_hobbies', {
            fields: ['tenant_id', 'patient_id', 'name'],
            type: 'unique',
            name: 'uq_patient_hobbies_unique_per_patient',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('patient_hobbies');
    },
};

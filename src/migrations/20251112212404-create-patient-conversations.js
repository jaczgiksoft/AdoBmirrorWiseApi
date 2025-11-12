'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('patient_conversations', {
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

            // 🧑‍⚕️ Usuario autor / participante
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'Usuario que registró o participó en la conversación',
            },

            // 💬 Título descriptivo
            title: {
                type: Sequelize.STRING(150),
                allowNull: false,
                comment: 'Título o asunto de la conversación',
            },

            // 🗒️ Contenido del mensaje o conversación
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
                comment: 'Contenido o detalle de la conversación entre paciente y personal clínico',
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
        await queryInterface.addIndex('patient_conversations', ['tenant_id'], {
            name: 'idx_patient_conversations_tenant',
        });

        await queryInterface.addIndex('patient_conversations', ['patient_id'], {
            name: 'idx_patient_conversations_patient',
        });

        await queryInterface.addIndex('patient_conversations', ['user_id'], {
            name: 'idx_patient_conversations_user',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('patient_conversations');
    },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('patient_notes', {
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

            // ✍️ Usuario autor
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'Usuario que escribió la nota',
            },

            // 📝 Título de la nota
            title: {
                type: Sequelize.STRING(150),
                allowNull: false,
                comment: 'Título o resumen de la nota clínica o administrativa',
            },

            // 📄 Contenido de la nota
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
                comment: 'Contenido detallado de la nota o registro clínico',
            },

            // 🔒 Privacidad
            is_private: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'True = nota privada (visible solo para el autor o roles permitidos)',
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
        await queryInterface.addIndex('patient_notes', ['tenant_id'], { name: 'idx_patient_notes_tenant' });
        await queryInterface.addIndex('patient_notes', ['patient_id'], { name: 'idx_patient_notes_patient' });
        await queryInterface.addIndex('patient_notes', ['user_id'], { name: 'idx_patient_notes_user' });
        await queryInterface.addIndex('patient_notes', ['is_private'], { name: 'idx_patient_notes_privacy' });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('patient_notes');
    },
};

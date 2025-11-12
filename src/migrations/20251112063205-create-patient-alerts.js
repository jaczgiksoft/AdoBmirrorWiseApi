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

            // 🏢 Multi-tenant
            tenant_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'tenants', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },

            // 👤 Paciente asociado
            patient_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'patients', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },

            // 📢 Información de la alerta
            title: { type: Sequelize.STRING(150), allowNull: false }, // Ej: "Alergia a penicilina"
            description: { type: Sequelize.TEXT, allowNull: true },

            // ⚙️ Propiedad administrativa
            is_admin_alert: { type: Sequelize.BOOLEAN, defaultValue: false },

            // 🕒 Sequelize timestamps (camelCase)
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            }
        });

        // Índices recomendados
        await queryInterface.addIndex('patient_alerts', ['tenant_id'], { name: 'patient_alerts_tenant_idx' });
        await queryInterface.addIndex('patient_alerts', ['patient_id'], { name: 'patient_alerts_patient_idx' });
        await queryInterface.addIndex('patient_alerts', ['is_admin_alert'], { name: 'patient_alerts_admin_idx' });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('patient_alerts');
    }
};

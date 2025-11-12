'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('patient_professions', {
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
                comment: 'Nombre o título profesional (ej. Dr., Lic., Ing., C.D., Mtro.)'
            },

            description: {
                type: Sequelize.STRING(255),
                allowNull: true,
                comment: 'Descripción o detalle del título profesional'
            },

            abbreviation: {
                type: Sequelize.STRING(20),
                allowNull: true,
                comment: 'Abreviatura estándar (ej. Dr., Mtra., C.D.)'
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

        await queryInterface.addIndex('patient_professions', ['tenant_id'], {
            name: 'idx_patient_professions_tenant'
        });

        await queryInterface.addIndex('patient_professions', ['name'], {
            name: 'idx_patient_professions_name'
        });

        await queryInterface.addIndex('patient_professions', ['abbreviation'], {
            name: 'idx_patient_professions_abbreviation'
        });

        await queryInterface.addConstraint('patient_professions', {
            fields: ['tenant_id', 'name'],
            type: 'unique',
            name: 'uq_patient_professions_tenant_name'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('patient_professions');
    }
};

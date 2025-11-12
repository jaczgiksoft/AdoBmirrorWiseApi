'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('referrals', {
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
                type: Sequelize.STRING(120),
                allowNull: false,
                comment: 'Nombre o fuente de referencia del paciente'
            },

            contact_name: {
                type: Sequelize.STRING(120),
                allowNull: true,
                comment: 'Persona de contacto si aplica'
            },

            contact_phone: {
                type: Sequelize.STRING(20),
                allowNull: true
            },

            contact_email: {
                type: Sequelize.STRING(120),
                allowNull: true
            },

            notes: {
                type: Sequelize.TEXT,
                allowNull: true
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

        await queryInterface.addIndex('referrals', ['tenant_id'], {
            name: 'idx_referrals_tenant'
        });

        await queryInterface.addIndex('referrals', ['name'], {
            name: 'idx_referrals_name'
        });

        await queryInterface.addIndex('referrals', ['contact_email'], {
            name: 'idx_referrals_contact_email'
        });

        // Unicidad: nombre único por tenant
        await queryInterface.addConstraint('referrals', {
            fields: ['tenant_id', 'name'],
            type: 'unique',
            name: 'uq_referrals_tenant_name'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('referrals');
    }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('occupations', {
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
                comment: 'Nombre de la ocupación o profesión del paciente'
            },

            description: {
                type: Sequelize.STRING(255),
                allowNull: true,
                comment: 'Descripción adicional o categoría de la ocupación'
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

        await queryInterface.addIndex('occupations', ['tenant_id'], {
            name: 'idx_occupations_tenant'
        });

        await queryInterface.addIndex('occupations', ['name'], {
            name: 'idx_occupations_name'
        });

        await queryInterface.addConstraint('occupations', {
            fields: ['tenant_id', 'name'],
            type: 'unique',
            name: 'uq_occupations_tenant_name'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('occupations');
    }
};

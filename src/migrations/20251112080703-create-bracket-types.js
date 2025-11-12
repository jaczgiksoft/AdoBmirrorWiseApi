'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('bracket_types', {
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
                comment: 'Nombre del tipo de bracket (ej. Metálico, Cerámico, Autoligado, etc.)'
            },

            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Descripción adicional o notas sobre el tipo de bracket'
            },

            material: {
                type: Sequelize.STRING(50),
                allowNull: true,
                comment: 'Material base (ej. acero inoxidable, zafiro, cerámica)'
            },

            manufacturer: {
                type: Sequelize.STRING(100),
                allowNull: true,
                comment: 'Fabricante o marca del bracket si aplica'
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

        await queryInterface.addIndex('bracket_types', ['tenant_id'], {
            name: 'idx_bracket_types_tenant'
        });

        await queryInterface.addIndex('bracket_types', ['name'], {
            name: 'idx_bracket_types_name'
        });

        await queryInterface.addIndex('bracket_types', ['material'], {
            name: 'idx_bracket_types_material'
        });

        await queryInterface.addIndex('bracket_types', ['manufacturer'], {
            name: 'idx_bracket_types_manufacturer'
        });

        await queryInterface.addConstraint('bracket_types', {
            fields: ['tenant_id', 'name'],
            type: 'unique',
            name: 'uq_bracket_types_tenant_name'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('bracket_types');
    }
};

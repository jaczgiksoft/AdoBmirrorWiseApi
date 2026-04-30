'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('elastic_types', {
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
                comment: 'Nombre o marca del elástico (ej. Ormco, GAC, etc.)'
            },

            color: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: '#CCCCCC',
                comment: 'Color distintivo para UI'
            },

            type: {
                type: Sequelize.STRING(50),
                allowNull: true,
                comment: 'Tipo (ej. Intraoral, Extraoral)'
            },

            size: {
                type: Sequelize.STRING(20),
                allowNull: false,
                comment: 'Tamaño (ej. 1/8", 3/16", 1/4", 5/16", 3/8")'
            },

            oz: {
                type: Sequelize.STRING(20),
                allowNull: false,
                comment: 'Fuerza en onzas (ej. 2.5oz, 3.5oz, 4.5oz, 6oz)'
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

        await queryInterface.addIndex('elastic_types', ['tenant_id'], {
            name: 'idx_elastic_types_tenant'
        });

        await queryInterface.addIndex('elastic_types', ['name'], {
            name: 'idx_elastic_types_name'
        });

        await queryInterface.addConstraint('elastic_types', {
            fields: ['tenant_id', 'name', 'size', 'oz'],
            type: 'unique',
            name: 'uq_elastic_types_tenant_config'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('elastic_types');
    }
};

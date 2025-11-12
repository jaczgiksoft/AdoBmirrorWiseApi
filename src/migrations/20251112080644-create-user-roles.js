'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user_roles', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },

            role_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'roles',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
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

        // Índices relacionales
        await queryInterface.addIndex('user_roles', ['user_id'], {
            name: 'idx_user_roles_user',
        });

        await queryInterface.addIndex('user_roles', ['role_id'], {
            name: 'idx_user_roles_role',
        });

        // Unicidad: evitar duplicar roles para el mismo usuario
        await queryInterface.addConstraint('user_roles', {
            fields: ['user_id', 'role_id'],
            type: 'unique',
            name: 'uq_user_roles_user_role',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('user_roles');
    },
};

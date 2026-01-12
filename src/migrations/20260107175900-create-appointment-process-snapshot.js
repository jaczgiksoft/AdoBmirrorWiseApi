'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Table: appointment_processes
        await queryInterface.createTable('appointment_processes', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            appointment_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'appointments',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            process_id: {
                type: Sequelize.INTEGER,
                allowNull: true, // Optional reference to original template
                references: {
                    model: 'processes',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            name_snapshot: {
                type: Sequelize.STRING,
                allowNull: false
            },
            total_minutes: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // 2. Table: appointment_process_steps
        await queryInterface.createTable('appointment_process_steps', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            appointment_process_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'appointment_processes',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            step_id: {
                type: Sequelize.INTEGER,
                allowNull: true, // Optional reference to original step
                references: {
                    model: 'steps',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            name_snapshot: {
                type: Sequelize.STRING,
                allowNull: false
            },
            order_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            duration_minutes: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Indexes for performance
        await queryInterface.addIndex('appointment_processes', ['appointment_id']);
        await queryInterface.addIndex('appointment_process_steps', ['appointment_process_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('appointment_process_steps');
        await queryInterface.dropTable('appointment_processes');
    }
};

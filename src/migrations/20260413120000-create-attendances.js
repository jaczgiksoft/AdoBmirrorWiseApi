'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('attendances', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
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
            employee_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'employees',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            date: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            check_in: {
                type: Sequelize.TIME,
                allowNull: true
            },
            check_out: {
                type: Sequelize.TIME,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('present', 'late', 'absent'),
                allowNull: false,
                defaultValue: 'present'
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
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

        // Indexes
        await queryInterface.addIndex('attendances', ['tenant_id'], {
            name: 'idx_attendances_tenant'
        });
        await queryInterface.addIndex('attendances', ['employee_id'], {
            name: 'idx_attendances_employee'
        });
        await queryInterface.addIndex('attendances', ['date'], {
            name: 'idx_attendances_date'
        });
        // Unique constraint for employee per day
        await queryInterface.addConstraint('attendances', {
            fields: ['tenant_id', 'employee_id', 'date'],
            type: 'unique',
            name: 'uq_attendances_tenant_employee_date'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('attendances');
    }
};

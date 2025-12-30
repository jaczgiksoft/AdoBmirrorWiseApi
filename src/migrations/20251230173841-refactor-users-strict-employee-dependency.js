'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove existing Foreign Key for employee_id
    // We try to find the constraint name dynamically
    const tableRefs = await queryInterface.getForeignKeyReferencesForTable('users');
    const employeeFk = tableRefs.find(fk => fk.columnName === 'employee_id');

    if (employeeFk) {
      await queryInterface.removeConstraint('users', employeeFk.constraintName);
    } else {
      console.log('Foreign Key for employee_id not found on users table.');
      // Try removing by standard naming if dynamic fails/not found?
      // Often it's 'users_employee_id_foreign_idx' or similar but let's assume it was removed if not found.
    }

    // 2. Change employee_id to NOT NULL
    // NOTE: This assumes all users have an employee_id. 
    // If not, this will fail. We are instructed to code defensively but assumes current users have it.
    await queryInterface.changeColumn('users', 'employee_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    // 3. Add new Foreign Key with ON DELETE CASCADE
    // We add it as a constraint.
    await queryInterface.addConstraint('users', {
      fields: ['employee_id'],
      type: 'foreign key',
      name: 'fk_users_employee_cascade', // explicit name
      references: {
        table: 'employees',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // 4. Add UNIQUE constraint to employee_id
    // This enforces 1:1
    // We might need to drop the old index 'idx_users_employee' if it exists and is not unique.
    try {
      await queryInterface.removeIndex('users', 'idx_users_employee');
    } catch (e) {
      // ignore if not exists
    }

    await queryInterface.addIndex('users', ['employee_id'], {
      unique: true,
      name: 'uq_users_employee_id'
    });
  },

  async down(queryInterface, Sequelize) {
    // 1. Remove Unique Index
    try {
      await queryInterface.removeIndex('users', 'uq_users_employee_id');
    } catch (e) { }

    // 2. Remove Foreign Key Cascade
    try {
      await queryInterface.removeConstraint('users', 'fk_users_employee_cascade');
    } catch (e) { }

    // 3. Revert column to Allow Null
    await queryInterface.changeColumn('users', 'employee_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // 4. Add old FK back (SET NULL)
    await queryInterface.addConstraint('users', {
      fields: ['employee_id'],
      type: 'foreign key',
      name: 'users_employee_id_fk_restored', // or let sequelize generate
      references: {
        table: 'employees',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // 5. Add non-unique index back
    await queryInterface.addIndex('users', ['employee_id'], {
      name: 'idx_users_employee'
    });
  }
};

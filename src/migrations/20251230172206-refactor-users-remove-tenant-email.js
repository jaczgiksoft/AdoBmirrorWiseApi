'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    // 1. Remove Index for tenant_id (idx_users_tenant)
    // We try/catch in case it doesn't exist to avoid breakage, but standard is it should exist.
    try {
      await queryInterface.removeIndex('users', 'idx_users_tenant');
    } catch (e) {
      console.log('Index idx_users_tenant might not exist or already removed:', e.message);
    }

    // 2. Remove Foreign Key for tenant_id
    // We need to find the dynamic name of the constraint
    const tableRefs = await queryInterface.getForeignKeyReferencesForTable('users');
    const tenantFk = tableRefs.find(fk => fk.columnName === 'tenant_id');

    if (tenantFk) {
      await queryInterface.removeConstraint('users', tenantFk.constraintName);
    } else {
      console.log('Foreign Key for tenant_id not found on users table.');
    }

    // 3. Remove tenant_id column
    await queryInterface.removeColumn('users', 'tenant_id');

    // 4. Remove Unique Constraint for email (uq_users_email)
    try {
      await queryInterface.removeConstraint('users', 'uq_users_email');
    } catch (e) {
      console.log('Constraint uq_users_email might not exist or already removed:', e.message);
      // If constraint removal fails, it might be an index-backed constraint, so we try removing index too
      try {
        await queryInterface.removeIndex('users', 'uq_users_email');
      } catch (idxErr) {
        // Ignore
      }
    }

    // 5. Remove email column
    await queryInterface.removeColumn('users', 'email');
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    // 1. Add tenant_id Column
    await queryInterface.addColumn('users', 'tenant_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Initially nullable to avoid breakage on existing rows? No, original was NOT NULL. But we can't fill it easily. Let's make it nullable or default to something? 
      // Original was allowNull: false. Reverting might be hard for existing data if we stripped it.
      // For 'down', we'll try to restore close to original state but maybe nullable if needed.
      // User instructions said "Be reversible".
      // If we deleted data, we can't restore it. So we just restore schema.
      references: {
        model: 'tenants',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // 2. Add Index idx_users_tenant
    await queryInterface.addIndex('users', ['tenant_id'], {
      name: 'idx_users_tenant'
    });

    // 3. Add email Column
    await queryInterface.addColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: true, // Cannot enforce Not Null on empty column unless we wipe data.
      comment: 'Correo de acceso al sistema'
    });

    // 4. Add Unique Constraint uq_users_email
    await queryInterface.addConstraint('users', {
      fields: ['email'],
      type: 'unique',
      name: 'uq_users_email'
    });
  }
};

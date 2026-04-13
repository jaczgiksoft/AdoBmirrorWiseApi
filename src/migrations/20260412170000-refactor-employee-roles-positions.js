'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Añadir role_id a employees
    await queryInterface.addColumn('employees', 'role_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Temporalmente true para no romper existentes sin rol
      references: { model: 'roles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'last_name'
    });

    // 2. Crear tabla intermedia employee_positions
    await queryInterface.createTable('employee_positions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      position_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'positions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 3. Eliminar columna position de employees (después de crear la nueva estructura)
    await queryInterface.removeColumn('employees', 'position');
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir cambios
    await queryInterface.addColumn('employees', 'position', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.dropTable('employee_positions');
    await queryInterface.removeColumn('employees', 'role_id');
  }
};

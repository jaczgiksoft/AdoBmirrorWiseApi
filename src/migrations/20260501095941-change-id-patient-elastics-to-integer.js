'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Quitar primary key actual (UUID)
    await queryInterface.removeConstraint('patient_elastics', 'PRIMARY');

    // 2. Renombrar columna actual (opcional, por si quieres conservar UUID)
    await queryInterface.renameColumn('patient_elastics', 'id', 'uuid');

    // 3. Crear nueva columna id autoincremental
    await queryInterface.addColumn('patient_elastics', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    });

    // 4. (Opcional) Si quieres que quede primero en la tabla (MySQL)
    await queryInterface.sequelize.query(`
      ALTER TABLE patient_elastics MODIFY id INT AUTO_INCREMENT FIRST;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revertir cambios

    // 1. Eliminar nueva PK
    await queryInterface.removeColumn('patient_elastics', 'id');

    // 2. Volver a renombrar uuid → id
    await queryInterface.renameColumn('patient_elastics', 'uuid', 'id');

    // 3. Volver a poner como PK
    await queryInterface.changeColumn('patient_elastics', 'id', {
      type: Sequelize.CHAR(36),
      primaryKey: true,
      allowNull: false,
    });
  }
};
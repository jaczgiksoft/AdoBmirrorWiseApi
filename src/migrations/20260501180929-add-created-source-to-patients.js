'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('patients', 'created_source', {
      type: Sequelize.ENUM('system', 'user'),
      allowNull: false,
      defaultValue: 'user'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('patients', 'created_source');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_patients_created_source";'); // opcional según DB
  }
};
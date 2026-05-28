module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tenants', 'date_format', {
      type: Sequelize.STRING,
      defaultValue: 'YYYY-MM-DD',
      allowNull: false
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tenants', 'date_format');
  }
};

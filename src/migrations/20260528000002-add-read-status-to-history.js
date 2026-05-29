module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('patient_notifications_history', 'is_read', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    await queryInterface.addColumn('patient_notifications_history', 'read_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('patient_notifications_history', 'is_read');
    await queryInterface.removeColumn('patient_notifications_history', 'read_at');
  }
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO tenant_modules (tenant_id, module, is_enabled)
      SELECT t.id, 'elastic_types', 1
      FROM tenants t
      WHERE NOT EXISTS (
        SELECT 1
        FROM tenant_modules tm
        WHERE tm.tenant_id = t.id
        AND tm.module = 'elastic_types'
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DELETE FROM tenant_modules
      WHERE module = 'elastic_types';
    `);
  }
};
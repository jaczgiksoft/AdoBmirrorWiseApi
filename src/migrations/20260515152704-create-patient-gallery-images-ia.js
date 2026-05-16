'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('patient_gallery_images_ia', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      patient_gallery_image_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'patient_gallery_images',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      file_path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mime_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('patient_gallery_images_ia');
  }
};

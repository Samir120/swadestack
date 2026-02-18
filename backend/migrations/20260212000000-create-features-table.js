'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Features', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title_en: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      title_sv: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      shortDescription_en: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      shortDescription_sv: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      fullDescription_en: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      fullDescription_sv: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      iconName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'HelpCircle',
      },
      previewImageUrl: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      previewImageFile: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      displayOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('Features', ['isActive']);
    await queryInterface.addIndex('Features', ['displayOrder']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Features');
  },
};

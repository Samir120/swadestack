'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Make serviceId nullable (for PC configuration orders)
    await queryInterface.changeColumn('OrderItems', 'serviceId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Services',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    });

    // Add pcConfigurationId column
    await queryInterface.addColumn('OrderItems', 'pcConfigurationId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'PCConfigurations',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    });

    // Add index for pcConfigurationId
    await queryInterface.addIndex('OrderItems', ['pcConfigurationId']);
  },

  async down(queryInterface, Sequelize) {
    // Remove index
    await queryInterface.removeIndex('OrderItems', ['pcConfigurationId']);

    // Remove pcConfigurationId column
    await queryInterface.removeColumn('OrderItems', 'pcConfigurationId');

    // Make serviceId required again
    await queryInterface.changeColumn('OrderItems', 'serviceId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Services',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    });
  }
};

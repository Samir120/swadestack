'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('OrderItems', 'serviceDescription', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'serviceName',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('OrderItems', 'serviceDescription');
  },
};

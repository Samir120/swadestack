'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('VatSettings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      vatRate: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 0.2500,
      },
      label_en: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'VAT',
      },
      label_sv: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'Moms',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Seed the initial row
    await queryInterface.bulkInsert('VatSettings', [
      {
        id: uuidv4(),
        vatRate: 0.2500,
        label_en: 'VAT',
        label_sv: 'Moms',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('VatSettings');
  },
};

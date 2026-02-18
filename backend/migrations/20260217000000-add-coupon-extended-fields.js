'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Coupons', 'maxDiscountAmount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    await queryInterface.addColumn('Coupons', 'applicableTo', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'all',
    });

    await queryInterface.addColumn('Coupons', 'applicableCategoryIds', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Coupons', 'firstOrderOnly', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('Coupons', 'combinable', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('Coupons', 'totalDiscountGiven', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Coupons', 'maxDiscountAmount');
    await queryInterface.removeColumn('Coupons', 'applicableTo');
    await queryInterface.removeColumn('Coupons', 'applicableCategoryIds');
    await queryInterface.removeColumn('Coupons', 'firstOrderOnly');
    await queryInterface.removeColumn('Coupons', 'combinable');
    await queryInterface.removeColumn('Coupons', 'totalDiscountGiven');
  },
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'couponId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Coupons',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addColumn('Orders', 'couponCode', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.addColumn('Orders', 'discountAmount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });

    await queryInterface.addIndex('Orders', ['couponId']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Orders', ['couponId']);
    await queryInterface.removeColumn('Orders', 'discountAmount');
    await queryInterface.removeColumn('Orders', 'couponCode');
    await queryInterface.removeColumn('Orders', 'couponId');
  },
};

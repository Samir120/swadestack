'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Coupons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      discountType: {
        type: Sequelize.ENUM('percentage', 'fixed_amount'),
        allowNull: false,
      },
      discountValue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      minimumOrderAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      maxUses: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      maxUsesPerUser: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      currentUses: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      validFrom: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      validUntil: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('Coupons', ['code'], { unique: true });
    await queryInterface.addIndex('Coupons', ['isActive']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Coupons');
  },
};

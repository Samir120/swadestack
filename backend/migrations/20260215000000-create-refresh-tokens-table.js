'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RefreshTokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      token: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      isRevoked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex('RefreshTokens', ['token']);
    await queryInterface.addIndex('RefreshTokens', ['userId']);
    await queryInterface.addIndex('RefreshTokens', ['expiresAt']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('RefreshTokens');
  },
};

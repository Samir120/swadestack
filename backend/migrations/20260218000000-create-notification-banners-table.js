'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUM types first
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_NotificationBanners_backgroundType" AS ENUM ('solid', 'gradient');`
    );
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_NotificationBanners_fontWeight" AS ENUM ('normal', 'medium', 'semibold', 'bold');`
    );
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_NotificationBanners_fontSize" AS ENUM ('xs', 'sm', 'base', 'lg');`
    );

    await queryInterface.createTable('NotificationBanners', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      message_en: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      message_sv: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      linkUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      linkText_en: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      linkText_sv: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      couponCode: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      showPhone: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      showEmail: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      backgroundColor: {
        type: Sequelize.STRING(7),
        allowNull: false,
        defaultValue: '#1e40af',
      },
      textColor: {
        type: Sequelize.STRING(7),
        allowNull: false,
        defaultValue: '#ffffff',
      },
      backgroundType: {
        type: Sequelize.ENUM('solid', 'gradient'),
        allowNull: false,
        defaultValue: 'solid',
      },
      gradientEndColor: {
        type: Sequelize.STRING(7),
        allowNull: true,
      },
      gradientDirection: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: 'to right',
      },
      fontWeight: {
        type: Sequelize.ENUM('normal', 'medium', 'semibold', 'bold'),
        allowNull: false,
        defaultValue: 'medium',
      },
      fontSize: {
        type: Sequelize.ENUM('xs', 'sm', 'base', 'lg'),
        allowNull: false,
        defaultValue: 'sm',
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      showOnAuthPages: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      showOnAdminPanel: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isDismissible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      showOnPages: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: ['all'],
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      impressions: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      clicks: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      dismissals: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addIndex('NotificationBanners', ['isActive']);
    await queryInterface.addIndex('NotificationBanners', ['priority']);
    await queryInterface.addIndex('NotificationBanners', ['startDate', 'endDate']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('NotificationBanners');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_NotificationBanners_backgroundType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_NotificationBanners_fontWeight";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_NotificationBanners_fontSize";');
  },
};

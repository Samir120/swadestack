'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add new columns to NewsletterSubscribers (if they don't exist)
    const subscriberTable = await queryInterface.describeTable('NewsletterSubscribers');

    if (!subscriberTable.userId) {
      await queryInterface.addColumn('NewsletterSubscribers', 'userId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
      });
      await queryInterface.addIndex('NewsletterSubscribers', ['userId']);
    }

    if (!subscriberTable.status) {
      await queryInterface.addColumn('NewsletterSubscribers', 'status', {
        type: Sequelize.ENUM('active', 'unsubscribed', 'bounced', 'pending_confirmation'),
        allowNull: false,
        defaultValue: 'active',
      });
      await queryInterface.addIndex('NewsletterSubscribers', ['status']);
    }

    if (!subscriberTable.source) {
      await queryInterface.addColumn('NewsletterSubscribers', 'source', {
        type: Sequelize.ENUM('registration', 'website_signup', 'checkout', 'admin_manual', 'csv_import'),
        allowNull: true,
      });
      await queryInterface.addIndex('NewsletterSubscribers', ['source']);
    }

    // 2. Create NewsletterSegments table
    await queryInterface.createTable('NewsletterSegments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('auto', 'manual'),
        allowNull: false,
        defaultValue: 'manual',
      },
      rules: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      subscriberCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    // 3. Create NewsletterSegmentMembers table
    await queryInterface.createTable('NewsletterSegmentMembers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      segmentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'NewsletterSegments', key: 'id' },
        onDelete: 'CASCADE',
      },
      subscriberId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'NewsletterSubscribers', key: 'id' },
        onDelete: 'CASCADE',
      },
      addedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('NewsletterSegmentMembers', ['segmentId', 'subscriberId'], {
      unique: true,
    });

    // 4. Create NewsletterCampaigns table
    await queryInterface.createTable('NewsletterCampaigns', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      previewText: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contentJson: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      templateId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft',
      },
      targetSegmentIds: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      targetSubscriberCount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      sentByAdminId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
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

    await queryInterface.addIndex('NewsletterCampaigns', ['status']);
    await queryInterface.addIndex('NewsletterCampaigns', ['sentByAdminId']);
    await queryInterface.addIndex('NewsletterCampaigns', ['scheduledAt']);

    // 5. Create NewsletterCampaignStats table
    await queryInterface.createTable('NewsletterCampaignStats', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      campaignId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'NewsletterCampaigns', key: 'id' },
        onDelete: 'CASCADE',
      },
      totalSent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalDelivered: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalOpened: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      uniqueOpens: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalClicked: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      uniqueClicks: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalUnsubscribed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalBounced: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalFailed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    // 6. Create NewsletterSendLogs table
    await queryInterface.createTable('NewsletterSendLogs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      campaignId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'NewsletterCampaigns', key: 'id' },
        onDelete: 'CASCADE',
      },
      subscriberId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'NewsletterSubscribers', key: 'id' },
        onDelete: 'CASCADE',
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'),
        allowNull: false,
        defaultValue: 'queued',
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      openedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      clickedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      bouncedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      failureReason: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex('NewsletterSendLogs', ['campaignId']);
    await queryInterface.addIndex('NewsletterSendLogs', ['subscriberId']);
    await queryInterface.addIndex('NewsletterSendLogs', ['status']);
    await queryInterface.addIndex('NewsletterSendLogs', ['campaignId', 'subscriberId']);

    // 7. Create NewsletterTemplates table
    await queryInterface.createTable('NewsletterTemplates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      previewThumbnailUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      globalStyles: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      socialMediaConfig: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: { platforms: [] },
      },
      footerConfig: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      contentBlocks: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      usageCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addIndex('NewsletterTemplates', ['isDefault']);
    await queryInterface.addIndex('NewsletterTemplates', ['name']);

    // 8. Add templateId FK to NewsletterCampaigns (now that templates table exists)
    await queryInterface.addConstraint('NewsletterCampaigns', {
      fields: ['templateId'],
      type: 'foreign key',
      name: 'fk_campaign_template',
      references: {
        table: 'NewsletterTemplates',
        field: 'id',
      },
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('NewsletterCampaigns', 'fk_campaign_template').catch(() => {});
    await queryInterface.dropTable('NewsletterTemplates');
    await queryInterface.dropTable('NewsletterSendLogs');
    await queryInterface.dropTable('NewsletterCampaignStats');
    await queryInterface.dropTable('NewsletterCampaigns');
    await queryInterface.dropTable('NewsletterSegmentMembers');
    await queryInterface.dropTable('NewsletterSegments');

    const subscriberTable = await queryInterface.describeTable('NewsletterSubscribers');
    if (subscriberTable.source) await queryInterface.removeColumn('NewsletterSubscribers', 'source');
    if (subscriberTable.status) await queryInterface.removeColumn('NewsletterSubscribers', 'status');
    if (subscriberTable.userId) await queryInterface.removeColumn('NewsletterSubscribers', 'userId');
  },
};

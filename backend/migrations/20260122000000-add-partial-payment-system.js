'use strict';

/**
 * Migration: Add Partial Payment System
 *
 * This migration adds support for two-phase partial payments:
 * - Creates Payments table for tracking individual payments
 * - Adds partial payment fields to Orders table
 * - Updates Order status enum to include new statuses
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create Payments table
    await queryInterface.createTable('Payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'SEK',
      },
      phase: {
        type: Sequelize.ENUM('initial', 'final', 'full'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      paymentIntentId: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      failureReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
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

    // 2. Add indexes to Payments table
    await queryInterface.addIndex('Payments', ['orderId'], {
      name: 'payments_order_id_idx',
    });
    await queryInterface.addIndex('Payments', ['status'], {
      name: 'payments_status_idx',
    });
    await queryInterface.addIndex('Payments', ['phase'], {
      name: 'payments_phase_idx',
    });
    await queryInterface.addIndex('Payments', ['paymentIntentId'], {
      name: 'payments_payment_intent_id_idx',
    });
    await queryInterface.addIndex('Payments', ['createdAt'], {
      name: 'payments_created_at_idx',
    });

    // 3. Add new columns to Orders table
    await queryInterface.addColumn('Orders', 'requiresPartialPayment', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('Orders', 'partialPaymentStatus', {
      type: Sequelize.ENUM('initial_pending', 'initial_paid', 'final_pending', 'full_paid'),
      allowNull: true,
    });

    await queryInterface.addColumn('Orders', 'readyForFinalPayment', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('Orders', 'readyForFinalPaymentAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Orders', 'notifiedForFinalPayment', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    // 4. Update Order status enum to include new statuses
    // Note: PostgreSQL requires special handling for ENUM updates
    // This approach works for both PostgreSQL and other databases

    // For PostgreSQL
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_Orders_status" ADD VALUE IF NOT EXISTS 'partial_paid';
        ALTER TYPE "enum_Orders_status" ADD VALUE IF NOT EXISTS 'awaiting_final';
      `);
    } else {
      // For MySQL/MariaDB, we need to recreate the column
      await queryInterface.changeColumn('Orders', 'status', {
        type: Sequelize.ENUM('pending', 'partial_paid', 'awaiting_final', 'paid', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
      });
    }

    console.log('✓ Partial payment system migration completed successfully');
  },

  async down(queryInterface, Sequelize) {
    console.log('Rolling back partial payment system migration...');

    // 1. Remove columns from Orders table
    await queryInterface.removeColumn('Orders', 'requiresPartialPayment');
    await queryInterface.removeColumn('Orders', 'partialPaymentStatus');
    await queryInterface.removeColumn('Orders', 'readyForFinalPayment');
    await queryInterface.removeColumn('Orders', 'readyForFinalPaymentAt');
    await queryInterface.removeColumn('Orders', 'notifiedForFinalPayment');

    // 2. Drop Payments table (CASCADE will handle foreign key constraints)
    await queryInterface.dropTable('Payments');

    // 3. Revert Order status enum
    // Note: Rolling back enum values is complex in PostgreSQL
    // This is a simplified version - in production, you may need a more sophisticated approach
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      console.log('⚠️  Warning: PostgreSQL enum values cannot be automatically removed.');
      console.log('   The enum values "partial_paid" and "awaiting_final" will remain in the database.');
      console.log('   If needed, manually clean up with:');
      console.log('   ALTER TYPE "enum_Orders_status" RENAME TO "enum_Orders_status_old";');
      console.log('   CREATE TYPE "enum_Orders_status" AS ENUM(\'pending\', \'paid\', \'cancelled\', \'completed\');');
      console.log('   ALTER TABLE "Orders" ALTER COLUMN status TYPE "enum_Orders_status" USING status::text::"enum_Orders_status";');
      console.log('   DROP TYPE "enum_Orders_status_old";');
    } else {
      // For MySQL/MariaDB
      await queryInterface.changeColumn('Orders', 'status', {
        type: Sequelize.ENUM('pending', 'paid', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
      });
    }

    // 4. Drop the ENUM types for partialPaymentStatus
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_Orders_partialPaymentStatus";
      `);
    }

    console.log('✓ Partial payment system migration rolled back');
  },
};

/**
 * Password Reset Script
 * This script resets a user's password that was corrupted by double-hashing
 *
 * Usage: node reset-password.js <email> <new-password>
 * Example: node reset-password.js user@example.com MyNewPass123
 */

const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');
const path = require('path');

// Get command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('\n❌ Error: Missing arguments');
  console.log('\nUsage: node reset-password.js <email> <new-password>');
  console.log('Example: node reset-password.js bina.kamfar@gmail.com MyNewPass123\n');
  process.exit(1);
}

// Validate password
if (newPassword.length < 6) {
  console.error('\n❌ Error: Password must be at least 6 characters\n');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('\n❌ Error: DATABASE_URL not found in environment variables\n');
  process.exit(1);
}

// Create database connection
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function resetPassword() {
  try {
    console.log('\n🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    console.log(`\n🔍 Finding user with email: ${email}`);
    const [user] = await sequelize.query(
      `SELECT id, email, "firstName", "lastName" FROM "Users" WHERE email = :email`,
      {
        replacements: { email },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (!user) {
      console.error(`\n❌ Error: User not found with email: ${email}\n`);
      await sequelize.close();
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.firstName} ${user.lastName}`);

    console.log('\n🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('💾 Updating password in database...');
    await sequelize.query(
      `UPDATE "Users" SET password = :password, "updatedAt" = NOW() WHERE email = :email`,
      {
        replacements: { password: hashedPassword, email },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );

    console.log('\n✅ Password reset successfully!');
    console.log(`\nYou can now login with:`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${newPassword}`);
    console.log('\n⚠️  Please change your password after logging in for security.\n');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

resetPassword();

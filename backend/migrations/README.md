# Database Migrations

This directory contains Sequelize migrations for the m24-design project.

## What are Migrations?

Migrations are version control for your database schema. They allow you to:
- Track database schema changes over time
- Apply changes safely in production
- Rollback changes if needed
- Collaborate with team members on schema changes

## Migration Files

Each migration file has:
- **Timestamp prefix** (e.g., `20260122000000`) - Ensures migrations run in order
- **Descriptive name** - Explains what the migration does
- **`up` function** - Applies the migration
- **`down` function** - Reverts the migration

## Available Migrations

### 20260122000000-add-partial-payment-system.js

Adds two-phase partial payment support:
- Creates `Payments` table for tracking individual payments
- Adds partial payment fields to `Orders` table
- Updates order status enum

**When to run:** Before deploying partial payment feature

## Running Migrations

### Check Status
```bash
npm run db:migrate:status
```

### Run Pending Migrations
```bash
# Development
npm run db:migrate

# Production
npm run db:migrate:production
```

### Rollback Last Migration
```bash
npm run db:migrate:undo
```

### Rollback All Migrations
```bash
npx sequelize-cli db:migrate:undo:all
```

## Creating New Migrations

### Using Sequelize CLI

```bash
# Generate a new migration file
npx sequelize-cli migration:generate --name description-of-changes

# Example
npx sequelize-cli migration:generate --name add-user-preferences
```

This creates a new file: `migrations/YYYYMMDDHHMMSS-add-user-preferences.js`

### Migration Template

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add your migration code here
    // Example: Create a table
    await queryInterface.createTable('TableName', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes from `up`
    await queryInterface.dropTable('TableName');
  },
};
```

## Best Practices

### ✅ DO

- **Always test migrations** on staging before production
- **Backup database** before running migrations in production
- **Write reversible migrations** - Always implement `down` function
- **Keep migrations small** - One logical change per migration
- **Use transactions** for complex migrations
- **Add indexes** for foreign keys and frequently queried columns
- **Document migrations** - Add comments explaining complex changes

### ❌ DON'T

- **Don't modify existing migrations** after they've been deployed
- **Don't delete migrations** - They're your schema history
- **Don't skip migrations** - Always run them in order
- **Don't reference models** - Migrations should be independent
- **Don't use sync** in production - Always use migrations

## Common Operations

### Add Column
```javascript
await queryInterface.addColumn('TableName', 'newColumn', {
  type: Sequelize.STRING,
  allowNull: true,
});
```

### Remove Column
```javascript
await queryInterface.removeColumn('TableName', 'columnName');
```

### Add Index
```javascript
await queryInterface.addIndex('TableName', ['columnName'], {
  name: 'index_name',
});
```

### Create Table
```javascript
await queryInterface.createTable('TableName', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  // ... other columns
});
```

### Update Enum
```javascript
// PostgreSQL
await queryInterface.sequelize.query(`
  ALTER TYPE "enum_TableName_columnName" ADD VALUE 'new_value';
`);

// MySQL
await queryInterface.changeColumn('TableName', 'columnName', {
  type: Sequelize.ENUM('value1', 'value2', 'new_value'),
});
```

### Add Foreign Key
```javascript
await queryInterface.addConstraint('TableName', {
  fields: ['foreignKeyColumn'],
  type: 'foreign key',
  name: 'fk_constraint_name',
  references: {
    table: 'ReferencedTable',
    field: 'id',
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
```

## Troubleshooting

### Migration Already Exists
If a migration has already been run, it's tracked in the `SequelizeMeta` table:

```sql
SELECT * FROM "SequelizeMeta";
```

To mark a migration as run without executing it:
```sql
INSERT INTO "SequelizeMeta" (name) VALUES ('20260122000000-add-partial-payment-system.js');
```

### Migration Failed Mid-Way
If a migration fails partway through:
1. Check what changes were applied
2. Manually clean up incomplete changes
3. Fix the migration
4. Run again or rollback

### Database Out of Sync
If your database schema doesn't match migrations:
1. Check migration status
2. Review what's actually in the database
3. Create a migration to sync them
4. Or reset (development only): drop tables and re-run all migrations

## Testing Migrations

### On Development Database
```bash
# Run migration
npm run db:migrate

# Test the changes
# Run your app, create test data

# Rollback
npm run db:migrate:undo

# Verify rollback worked correctly
```

### On Staging/Production
```bash
# Always backup first!
pg_dump $DATABASE_URL > backup.sql

# Check status
npm run db:migrate:status

# Run migration
npm run db:migrate:production

# Verify success
psql $DATABASE_URL -c "SELECT * FROM \"SequelizeMeta\";"
```

## Emergency Rollback

If something goes wrong in production:

```bash
# Stop the application
pm2 stop all

# Rollback the migration
npm run db:migrate:undo

# Or restore from backup
psql $DATABASE_URL < backup.sql

# Start the application with old code
pm2 start all
```

## Configuration

Migration configuration is in:
- **`.sequelizerc`** - Paths to migrations, models, config
- **`src/config/database.js`** - Database connection settings

## Further Reading

- [Sequelize Migrations Documentation](https://sequelize.org/docs/v6/other-topics/migrations/)
- [Migration Best Practices](https://sequelize.org/docs/v6/other-topics/migrations/#migration-skeleton)
- Project Migration Guide: `../../MIGRATION_GUIDE.md`

---

**Remember:** Migrations are your database's version control. Treat them with care!

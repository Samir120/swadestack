import { Sequelize } from 'sequelize';
import { config } from './environment';

export const sequelize = new Sequelize({
  database: config.database.name,
  username: config.database.user,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  dialect: 'postgres',
  logging: config.env === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // `sync({ alter: true })` is DEVELOPMENT ONLY.
    //
    // On every boot it re-issues ADD CONSTRAINT for each column declared
    // `unique: true`, because it never checks whether an equivalent unique
    // constraint already exists. Postgres accepts each one under a new
    // auto-generated name (Users_email_key1, _key2, ...), so the count grew by
    // one per table per restart — 1,500+ duplicate constraints across 7 tables
    // before this was caught. Every duplicate is a real index that must be
    // maintained on each INSERT/UPDATE.
    //
    // Production uses migrations instead: `npm run db:migrate:production`.
    // Schema changes will NOT auto-apply on deploy any more — add a migration.
    if (config.env === 'production') {
      console.log('Schema sync skipped (production) — apply changes via npm run db:migrate:production');
    } else {
      await sequelize.sync({ alter: true });
      console.log('Database schema synchronized (development)');
    }
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

export default sequelize;

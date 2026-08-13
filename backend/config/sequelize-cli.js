/**
 * Sequelize CLI Configuration
 * Used for running migrations and seeders
 *
 * This mirrors src/config/environment.ts: the project configures Postgres with
 * discrete DB_* variables, not a DATABASE_URL connection string. The previous
 * version of this file read only process.env.DATABASE_URL — which is not set
 * anywhere — so every sequelize-cli command failed with
 * "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string".
 *
 * DATABASE_URL is still honoured when present so hosted environments that
 * provide one keep working.
 *
 * SSL is opt-in via DB_SSL=true. It used to be forced on in production, which
 * cannot work against the local Postgres this app actually talks to.
 */

require('dotenv').config();

const useSsl = process.env.DB_SSL === 'true';

const base = {
  dialect: 'postgres',
  dialectOptions: useSsl
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
};

/** Prefer DATABASE_URL when provided, otherwise assemble from DB_* vars. */
const connection = () =>
  process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        database: process.env.DB_NAME || 'portfolio_ecommerce',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
      };

module.exports = {
  development: {
    ...base,
    ...connection(),
    logging: console.log,
  },
  production: {
    ...base,
    ...connection(),
    logging: false,
    pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
  },
  test: {
    ...base,
    ...connection(),
    logging: false,
  },
};

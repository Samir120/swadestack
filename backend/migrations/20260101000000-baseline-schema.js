'use strict';

const fs = require('fs');
const path = require('path');

/**
 * BASELINE SCHEMA
 *
 * Every migration that follows this one assumes tables like Orders, OrderItems,
 * SiteSettings and NewsletterSubscribers already exist. Nothing ever created
 * them: the base schema was built by `sequelize.sync({ alter: true })`, which
 * ran on every boot until 2026-08-13. Running the migration set against an
 * empty database therefore failed on the very first migration with
 * `relation "Orders" does not exist`.
 *
 * This migration closes that gap. It creates the schema exactly as it stood
 * immediately BEFORE 20260122000000-add-partial-payment-system — that is,
 * production as of the audit, minus every object the 13 later migrations create.
 * It is timestamped ahead of all of them so the full set now runs from empty.
 *
 * The DDL is kept as plain .sql next to this file rather than transcribed into
 * queryInterface calls, so it stays byte-for-byte what pg_dump produced and can
 * be diffed against production directly.
 *
 * Generated 2026-08-13 from the live schema. Do not edit by hand — if the
 * baseline ever needs to change, regenerate it and re-run the audit.
 */

const readSql = (name) =>
  fs.readFileSync(path.join(__dirname, 'sql', name), 'utf8');

module.exports = {
  async up(queryInterface) {
    const sql = readSql('20260101000000-baseline-schema.sql');
    await queryInterface.sequelize.query(sql);
  },

  async down(queryInterface) {
    const sql = readSql('20260101000000-baseline-schema.down.sql');
    await queryInterface.sequelize.query(sql);
  },
};

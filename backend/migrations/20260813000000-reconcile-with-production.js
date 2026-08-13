'use strict';

const fs = require('fs');
const path = require('path');

/**
 * RECONCILE MIGRATION-PRODUCED SCHEMA WITH PRODUCTION
 *
 * `sequelize.sync({ alter: true })` ran on every boot until 2026-08-13 and made
 * real schema changes that no migration records: columns added to models after
 * their migration was written, FK rules rewritten to Sequelize's association
 * defaults, model-declared indexes created alongside migration-declared ones,
 * and DB-level defaults stripped.
 *
 * This migration replays that drift so a fresh database built from migrations
 * matches the live schema. It is the tail of the audit: baseline (20260101)
 * establishes the pre-migration schema, the 13 original migrations run, and
 * this one lands the accumulated sync drift on top.
 *
 * It is intentionally written as raw SQL — these are corrective statements
 * derived from a live-vs-migrated diff, not model-driven schema authoring.
 *
 * NOTE: this had NOT been applied to production at the time of writing; against
 * production every statement is already satisfied and is a no-op by design
 * (IF EXISTS / IF NOT EXISTS, and FK re-creation to the shape already live).
 */

const readSql = (name) =>
  fs.readFileSync(path.join(__dirname, 'sql', name), 'utf8');

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      readSql('20260813000000-reconcile-with-production.sql')
    );
  },

  async down() {
    // Deliberately not reversible. Reversing would re-introduce the drift this
    // migration exists to remove, and the "before" state is not a state the
    // application ever intentionally targeted.
    throw new Error(
      'reconcile-with-production is not reversible — restore from a schema dump instead'
    );
  },
};

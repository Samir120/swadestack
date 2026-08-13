-- ===========================================================================
-- Reconcile the migration-produced schema with live production.
--
-- Every statement here closes a gap found by the 2026-08-13 baseline audit,
-- where `sync({ alter: true })` had changed production without a matching
-- migration. Grouped by the kind of drift.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Columns the models gained after their migration was written.
-- ---------------------------------------------------------------------------
ALTER TABLE "NewsletterCampaigns" ADD COLUMN IF NOT EXISTS "targetSubscriberIds" jsonb;
ALTER TABLE "Payments" ADD COLUMN IF NOT EXISTS "klarnaOrderId" character varying(255);
ALTER TABLE "Payments" ADD COLUMN IF NOT EXISTS "klarnaReference" character varying(255);

-- Dropped from the Payments model; sync removed it from production.
-- Dropping the column also removes payments_payment_intent_id_idx.
ALTER TABLE "Payments" DROP COLUMN IF EXISTS "paymentIntentId";

-- ---------------------------------------------------------------------------
-- 2. Column definitions that diverged from the model.
-- ---------------------------------------------------------------------------
ALTER TABLE "NewsletterSegments" ALTER COLUMN "name" TYPE character varying(255);
ALTER TABLE "NewsletterSegmentMembers" ALTER COLUMN "addedAt" SET NOT NULL;
ALTER TABLE "VatSettings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- ---------------------------------------------------------------------------
-- 3. Defaults Sequelize strips.
--
-- Sequelize populates timestamps and model-level defaults in application code
-- and does not keep DB-level defaults for them, so sync dropped every one of
-- these. The migrations still declare them, which is the difference.
-- ---------------------------------------------------------------------------
ALTER TABLE "Coupons"                  ALTER COLUMN "createdAt" DROP DEFAULT, ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "Features"                 ALTER COLUMN "createdAt" DROP DEFAULT, ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "NewsletterCampaigns"      ALTER COLUMN "createdAt" DROP DEFAULT, ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "NewsletterCampaignStats"  ALTER COLUMN "createdAt" DROP DEFAULT, ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "NewsletterSegmentMembers" ALTER COLUMN "createdAt" DROP DEFAULT, ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "NewsletterSegments"       ALTER COLUMN "createdAt" DROP DEFAULT, ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "NewsletterSendLogs"       ALTER COLUMN "createdAt" DROP DEFAULT, ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "NewsletterTemplates"      ALTER COLUMN "createdAt" DROP DEFAULT, ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "NotificationBanners"      ALTER COLUMN "createdAt" DROP DEFAULT, ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "Payments"                 ALTER COLUMN "createdAt" DROP DEFAULT, ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "RefreshTokens"            ALTER COLUMN "createdAt" DROP DEFAULT, ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "VatSettings"              ALTER COLUMN "createdAt" DROP DEFAULT, ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "NewsletterSegments"  ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "NewsletterTemplates"
  ALTER COLUMN "contentBlocks"     DROP DEFAULT,
  ALTER COLUMN "footerConfig"      DROP DEFAULT,
  ALTER COLUMN "globalStyles"      DROP DEFAULT,
  ALTER COLUMN "socialMediaConfig" DROP DEFAULT;

-- ---------------------------------------------------------------------------
-- 4. Enum value added to the model after the migration.
-- ---------------------------------------------------------------------------
ALTER TYPE "enum_Payments_phase" ADD VALUE IF NOT EXISTS 'additional';

-- ---------------------------------------------------------------------------
-- 5. Foreign keys.
--
-- Sequelize associations default to ON UPDATE CASCADE, which sync applied to
-- every FK it managed; the migrations declared only onDelete. sync also renamed
-- fk_campaign_template to the Postgres default name.
-- ---------------------------------------------------------------------------
ALTER TABLE "NewsletterCampaigns" DROP CONSTRAINT IF EXISTS "fk_campaign_template";
ALTER TABLE "NewsletterCampaigns" DROP CONSTRAINT IF EXISTS "NewsletterCampaigns_templateId_fkey";
ALTER TABLE "NewsletterCampaigns"
  ADD CONSTRAINT "NewsletterCampaigns_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "NewsletterTemplates"(id)
  ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE "NewsletterCampaigns" DROP CONSTRAINT IF EXISTS "NewsletterCampaigns_sentByAdminId_fkey";
ALTER TABLE "NewsletterCampaigns"
  ADD CONSTRAINT "NewsletterCampaigns_sentByAdminId_fkey"
  FOREIGN KEY ("sentByAdminId") REFERENCES "Users"(id)
  ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE "NewsletterCampaignStats" DROP CONSTRAINT IF EXISTS "NewsletterCampaignStats_campaignId_fkey";
ALTER TABLE "NewsletterCampaignStats"
  ADD CONSTRAINT "NewsletterCampaignStats_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "NewsletterCampaigns"(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "NewsletterSegmentMembers" DROP CONSTRAINT IF EXISTS "NewsletterSegmentMembers_segmentId_fkey";
ALTER TABLE "NewsletterSegmentMembers"
  ADD CONSTRAINT "NewsletterSegmentMembers_segmentId_fkey"
  FOREIGN KEY ("segmentId") REFERENCES "NewsletterSegments"(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "NewsletterSegmentMembers" DROP CONSTRAINT IF EXISTS "NewsletterSegmentMembers_subscriberId_fkey";
ALTER TABLE "NewsletterSegmentMembers"
  ADD CONSTRAINT "NewsletterSegmentMembers_subscriberId_fkey"
  FOREIGN KEY ("subscriberId") REFERENCES "NewsletterSubscribers"(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "NewsletterSendLogs" DROP CONSTRAINT IF EXISTS "NewsletterSendLogs_campaignId_fkey";
ALTER TABLE "NewsletterSendLogs"
  ADD CONSTRAINT "NewsletterSendLogs_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "NewsletterCampaigns"(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "NewsletterSendLogs" DROP CONSTRAINT IF EXISTS "NewsletterSendLogs_subscriberId_fkey";
ALTER TABLE "NewsletterSendLogs"
  ADD CONSTRAINT "NewsletterSendLogs_subscriberId_fkey"
  FOREIGN KEY ("subscriberId") REFERENCES "NewsletterSubscribers"(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "NewsletterSubscribers" DROP CONSTRAINT IF EXISTS "NewsletterSubscribers_userId_fkey";
ALTER TABLE "NewsletterSubscribers"
  ADD CONSTRAINT "NewsletterSubscribers_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "Users"(id)
  ON UPDATE CASCADE ON DELETE SET NULL;

-- Production keeps SET NULL here, not the RESTRICT the migration declared.
ALTER TABLE "OrderItems" DROP CONSTRAINT IF EXISTS "OrderItems_pcConfigurationId_fkey";
ALTER TABLE "OrderItems"
  ADD CONSTRAINT "OrderItems_pcConfigurationId_fkey"
  FOREIGN KEY ("pcConfigurationId") REFERENCES "PCConfigurations"(id)
  ON DELETE SET NULL;

-- Duplicate of OrderItems_serviceId_fkey, created because the baseline already
-- carried the FK; Postgres suffixed the second one.
ALTER TABLE "OrderItems" DROP CONSTRAINT IF EXISTS "OrderItems_serviceId_fkey1";

-- ---------------------------------------------------------------------------
-- 6. Indexes.
--
-- Production carries the model-declared index names (no _idx suffix) that sync
-- created, and lacks two the migration added.
-- ---------------------------------------------------------------------------
DROP INDEX IF EXISTS "payments_created_at_idx";
CREATE INDEX IF NOT EXISTS "payments_created_at"      ON "Payments" ("createdAt");
CREATE INDEX IF NOT EXISTS "payments_klarna_order_id" ON "Payments" ("klarnaOrderId");
CREATE INDEX IF NOT EXISTS "payments_order_id"        ON "Payments" ("orderId");
CREATE INDEX IF NOT EXISTS "payments_phase"           ON "Payments" (phase);
CREATE INDEX IF NOT EXISTS "payments_status"          ON "Payments" (status);

CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_segments_name" ON "NewsletterSegments" (name);
CREATE INDEX IF NOT EXISTS "newsletter_segment_members_segment_id"    ON "NewsletterSegmentMembers" ("segmentId");
CREATE INDEX IF NOT EXISTS "newsletter_segment_members_subscriber_id" ON "NewsletterSegmentMembers" ("subscriberId");
CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_campaign_stats_campaign_id" ON "NewsletterCampaignStats" ("campaignId");

-- Not present in production: sync dropped it (not declared on the Order model).
DROP INDEX IF EXISTS "orders_coupon_id";

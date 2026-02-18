import path from 'path';
import fs from 'fs';
import { Sequelize } from 'sequelize';
import { config } from '../config/environment';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function decodeBase64ToFile(dataUri: string): string | null {
  const match = dataUri.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return null;

  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, buffer);
  return `/uploads/${filename}`;
}

async function migrate() {
  const sequelize = new Sequelize({
    database: config.database.name,
    username: config.database.user,
    password: config.database.password,
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Migrate PortfolioItems
    const [portfolioItems] = await sequelize.query(
      `SELECT id, "imageUrl", "imageFile" FROM "PortfolioItems" WHERE "imageFile" LIKE 'data:%' OR "imageUrl" LIKE 'data:%'`
    ) as [any[], unknown];
    console.log(`Found ${portfolioItems.length} PortfolioItems with base64 data`);
    for (const item of portfolioItems) {
      const source = item.imageFile || item.imageUrl;
      const url = decodeBase64ToFile(source);
      if (url) {
        await sequelize.query(
          `UPDATE "PortfolioItems" SET "imageUrl" = $1, "imageFile" = $1 WHERE id = $2`,
          { bind: [url, item.id] }
        );
        console.log(`  Migrated PortfolioItem ${item.id} -> ${url}`);
      }
    }

    // Migrate Services
    const [services] = await sequelize.query(
      `SELECT id, "imageUrl", "imageFile" FROM "Services" WHERE "imageFile" LIKE 'data:%' OR "imageUrl" LIKE 'data:%'`
    ) as [any[], unknown];
    console.log(`Found ${services.length} Services with base64 data`);
    for (const item of services) {
      const source = item.imageFile || item.imageUrl;
      const url = decodeBase64ToFile(source);
      if (url) {
        await sequelize.query(
          `UPDATE "Services" SET "imageUrl" = $1, "imageFile" = $1 WHERE id = $2`,
          { bind: [url, item.id] }
        );
        console.log(`  Migrated Service ${item.id} -> ${url}`);
      }
    }

    // Migrate Banners
    const [banners] = await sequelize.query(
      `SELECT id, image_url, image_file FROM "Banner" WHERE image_file LIKE 'data:%' OR image_url LIKE 'data:%'`
    ) as [any[], unknown];
    console.log(`Found ${banners.length} Banners with base64 data`);
    for (const item of banners) {
      const source = item.image_file || item.image_url;
      const url = decodeBase64ToFile(source);
      if (url) {
        await sequelize.query(
          `UPDATE "Banner" SET image_url = $1, image_file = $1 WHERE id = $2`,
          { bind: [url, item.id] }
        );
        console.log(`  Migrated Banner ${item.id} -> ${url}`);
      }
    }

    // Migrate TeamMembers
    const [teamMembers] = await sequelize.query(
      `SELECT id, image_url, image_file FROM "TeamMember" WHERE image_file LIKE 'data:%' OR image_url LIKE 'data:%'`
    ) as [any[], unknown];
    console.log(`Found ${teamMembers.length} TeamMembers with base64 data`);
    for (const item of teamMembers) {
      const source = item.image_file || item.image_url;
      const url = decodeBase64ToFile(source);
      if (url) {
        await sequelize.query(
          `UPDATE "TeamMember" SET image_url = $1, image_file = $1 WHERE id = $2`,
          { bind: [url, item.id] }
        );
        console.log(`  Migrated TeamMember ${item.id} -> ${url}`);
      }
    }

    // Migrate Users (avatarUrl)
    const [users] = await sequelize.query(
      `SELECT id, "avatarUrl" FROM "Users" WHERE "avatarUrl" LIKE 'data:%'`
    ) as [any[], unknown];
    console.log(`Found ${users.length} Users with base64 avatar`);
    for (const item of users) {
      const url = decodeBase64ToFile(item.avatarUrl);
      if (url) {
        await sequelize.query(
          `UPDATE "Users" SET "avatarUrl" = $1 WHERE id = $2`,
          { bind: [url, item.id] }
        );
        console.log(`  Migrated User ${item.id} -> ${url}`);
      }
    }

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();

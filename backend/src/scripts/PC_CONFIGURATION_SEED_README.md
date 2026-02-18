# PC Configuration System - Seed Scripts Documentation

This directory contains seed scripts to populate the database with sample data for the PC Configuration system.

## Overview

The PC Configuration system requires three types of data:
1. **PC Components** - Hardware components (CPUs, motherboards, RAM, GPUs, storage, PSUs, cases, cooling)
2. **Compatibility Rules** - Validation rules for hardware compatibility
3. **Build Service Options** - Service pricing options (DIY vs professional assembly)

## Available Seed Scripts

### 1. Individual Seed Scripts

Run these scripts individually if you need to seed specific data:

#### PC Components Seed
```bash
cd backend
ts-node src/scripts/seedPCComponents.ts
```

**What it seeds:**
- 62 realistic PC components across 8 component types:
  - 6 CPUs (AMD Ryzen 7000/9000 series, Intel Core 13th/14th gen)
  - 4 Motherboards (ASUS, MSI - AM5 and LGA1700)
  - 3 RAM kits (DDR5 and DDR4 modules)
  - 4 GPUs (NVIDIA RTX 4090/4080/4070, AMD RX 7900 XTX)
  - 3 Storage drives (Samsung/WD NVMe, Samsung SATA SSD)
  - 4 PSUs (Corsair, Seasonic, EVGA, Cooler Master - 650W to 1000W)
  - 4 Cases (Fractal Design, NZXT, Lian Li, Corsair)
  - 4 Cooling solutions (Noctua air, be quiet! air, Corsair AIO, Arctic AIO)

**Features:**
- Realistic specifications for all components
- Proper socket types (AM5, LGA1700)
- Accurate TDP values and power consumption
- Physical dimensions for compatibility checking
- Full bilingual support (English/Swedish)
- Stock quantities for each component

#### Compatibility Rules Seed
```bash
cd backend
ts-node src/scripts/seedPCCompatibilityRules.ts
```

**What it seeds:**
- 15 validation rules covering 6 rule types:
  - **cpu_motherboard**: Socket compatibility
  - **motherboard_ram**: RAM type (DDR4/DDR5) and speed validation
  - **gpu_case**: Physical GPU clearance in case
  - **psu_power**: Total system power draw vs PSU wattage
  - **storage_motherboard**: NVMe/SATA interface support
  - **cooling_cpu**: Cooler socket compatibility and TDP rating

**Rule Severity:**
- **Errors** (blocking): Incompatible selections prevent checkout
- **Warnings** (non-blocking): Show caution but allow configuration

#### Build Service Options Seed
```bash
cd backend
ts-node src/scripts/seedPCBuildServiceOptions.ts
```

**What it seeds:**
- 5 build service options:
  - **DIY - Build It Yourself** (0 SEK) - Default option
  - **Standard Build Service** (2,500 SEK fixed)
  - **Premium Build Service** (4,999 SEK fixed)
  - **Percentage Build Service** (10% of component total) - Disabled by default
  - **Express Build Service** (3,999 SEK fixed - rush orders)

**Features:**
- Fixed and percentage-based pricing models
- Warranty information
- Estimated build times
- Bilingual descriptions

### 2. Master Seed Script (Recommended)

Run all seed scripts in sequence with a single command:

```bash
cd backend
ts-node src/scripts/seedPCConfigurationSystem.ts
```

**What it does:**
1. Tests database connection
2. Runs PC Components seed (62 components)
3. Runs Compatibility Rules seed (15 rules)
4. Runs Build Service Options seed (5 options)
5. Provides a comprehensive summary with success/failure stats
6. Shows next steps for testing

**Advantages:**
- One command to seed everything
- Error handling for each seed step
- Detailed summary report
- Duration tracking
- Continues even if one seed fails

## Prerequisites

Before running seed scripts, ensure:

1. **PostgreSQL is running** and accessible
2. **Environment variables are configured** in `backend/.env`:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/m24_design
   ```
3. **TypeScript dependencies are installed**:
   ```bash
   cd backend
   npm install
   ```
4. **Database models are synced** (seed scripts auto-sync with `alter: true`)

## Usage Examples

### Fresh Database Setup
```bash
# Run all seeds in sequence (recommended)
cd backend
ts-node src/scripts/seedPCConfigurationSystem.ts
```

### Update Only Components
```bash
# Re-seed components without touching rules or services
cd backend
ts-node src/scripts/seedPCComponents.ts
```

### Update Only Compatibility Rules
```bash
# Useful when adding new validation rules
cd backend
ts-node src/scripts/seedPCCompatibilityRules.ts
```

### Update Only Build Service Options
```bash
# Useful when changing pricing
cd backend
ts-node src/scripts/seedPCBuildServiceOptions.ts
```

## What Happens When Seeding

Each seed script follows this pattern:

1. **Connect to database** using `DATABASE_URL` from `.env`
2. **Initialize Sequelize models** for the relevant tables
3. **Clear existing data** using `truncate: true` (⚠️ WARNING: This deletes all data!)
4. **Insert seed data** with full bilingual content
5. **Display summary** with counts and statistics
6. **Close database connection**

**⚠️ IMPORTANT:** Seed scripts **DELETE ALL EXISTING DATA** in the target tables before seeding. Do not run in production with real data!

## Testing the Seeded Data

After seeding, test the API endpoints:

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```

### 2. Test PC Components API
```bash
# Get all CPUs
curl http://localhost:5000/api/pc-components?type=cpu

# Search components
curl http://localhost:5000/api/pc-components/search?q=Ryzen

# Get component by ID
curl http://localhost:5000/api/pc-components/{component-id}

# Get manufacturers
curl http://localhost:5000/api/pc-components/manufacturers?type=gpu
```

### 3. Test Build Services API
```bash
# Get active build service options
curl http://localhost:5000/api/pc-build-services

# Get default option
curl http://localhost:5000/api/pc-build-services/default

# Calculate service charge
curl -X POST http://localhost:5000/api/pc-build-services/calculate \
  -H "Content-Type: application/json" \
  -d '{"totalPrice": 25000, "optionId": "{option-id}"}'
```

### 4. Test PC Configuration API (Requires Authentication)
```bash
# Login first to get JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use token in subsequent requests
curl http://localhost:5000/api/pc-configurations \
  -H "Authorization: Bearer {your-jwt-token}"
```

## Verifying Data in PostgreSQL

Connect to PostgreSQL and verify the seeded data:

```sql
-- Check component counts by type
SELECT
  "componentType",
  COUNT(*) as count,
  AVG(price) as avg_price,
  SUM(stock) as total_stock
FROM "PCComponents"
GROUP BY "componentType"
ORDER BY "componentType";

-- Check compatibility rules by type and severity
SELECT
  "ruleType",
  "severity",
  COUNT(*) as count
FROM "PCCompatibilityRules"
WHERE "isActive" = true
GROUP BY "ruleType", "severity"
ORDER BY "ruleType", "severity";

-- Check build service options
SELECT
  "name_en",
  "priceType",
  "amount",
  "isActive",
  "isDefault"
FROM "PCBuildServiceOptions"
ORDER BY "amount";

-- Sample CPU specifications
SELECT
  "name_en",
  "manufacturer",
  "price",
  "specifications"
FROM "PCComponents"
WHERE "componentType" = 'cpu'
LIMIT 3;
```

## Customizing Seed Data

### Adding More Components

Edit [seedPCComponents.ts](seedPCComponents.ts) and add entries to the component arrays:

```typescript
const cpus = [
  // ... existing CPUs
  {
    componentType: 'cpu',
    name_en: 'Intel Core i9-14900K',
    name_sv: 'Intel Core i9-14900K',
    manufacturer: 'Intel',
    price: 6999,
    specifications: {
      socket: 'LGA1700',
      tdp: 253,
      cores: 24,
      threads: 32,
      baseClock: 3.0,
      boostClock: 6.0,
    },
    stock: 8,
  },
];
```

### Adding New Compatibility Rules

Edit [seedPCCompatibilityRules.ts](seedPCCompatibilityRules.ts):

```typescript
{
  ruleType: 'cpu_motherboard',
  rule: {
    field1: 'specifications.socket',
    field2: 'specifications.socket',
    operator: 'equals',
  },
  errorMessage_en: 'Your custom error message here',
  errorMessage_sv: 'Ditt anpassade felmeddelande här',
  severity: 'error', // or 'warning'
  isActive: true,
}
```

### Modifying Build Service Pricing

Edit [seedPCBuildServiceOptions.ts](seedPCBuildServiceOptions.ts):

```typescript
{
  name_en: 'Custom Build Service',
  name_sv: 'Anpassad byggservice',
  priceType: 'fixed', // or 'percentage'
  amount: 3500, // Fixed SEK or percentage value
  isActive: true,
  isDefault: false,
}
```

## Troubleshooting

### Error: "Unable to connect to the database"
**Solution:**
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `backend/.env`
- Ensure database exists: `createdb m24_design`

### Error: "relation does not exist"
**Solution:**
- Run migrations first: `cd backend && npm run db:migrate`
- Or let seed scripts auto-sync with `alter: true`

### Error: "ts-node: command not found"
**Solution:**
- Install ts-node globally: `npm install -g ts-node`
- Or use npx: `npx ts-node src/scripts/seedPCComponents.ts`

### Error: "Cannot find module '@/models/sequelize/...'"
**Solution:**
- Ensure you're running from the `backend` directory
- Check that all dependencies are installed: `npm install`

### Seed Completes but No Data in Database
**Solution:**
- Check for schema mismatches (table names, column names)
- Verify Sequelize model definitions match database schema
- Check PostgreSQL logs for errors

## Next Steps After Seeding

1. **Test API Endpoints** using Postman, Insomnia, or curl
2. **Verify Validation Logic** by creating test configurations with incompatible components
3. **Begin Frontend Implementation**:
   - Create Redux slices for PC components and configurations
   - Build PC Builder UI with component selection
   - Implement real-time compatibility validation
4. **Admin Panel Integration**:
   - Add PC Component management interface
   - Add Compatibility Rule management
   - Add Build Service pricing configuration

## Production Considerations

**⚠️ DO NOT run seed scripts in production!** They will delete all existing data.

For production data:
1. Use proper migrations instead of seed scripts
2. Import real component data from manufacturers
3. Configure compatibility rules through admin panel
4. Set appropriate build service pricing

## Summary

| Script | Components | Rules | Services | Use Case |
|--------|-----------|-------|----------|----------|
| `seedPCComponents.ts` | ✅ 62 | ❌ | ❌ | Update components only |
| `seedPCCompatibilityRules.ts` | ❌ | ✅ 15 | ❌ | Update validation rules |
| `seedPCBuildServiceOptions.ts` | ❌ | ❌ | ✅ 5 | Update service pricing |
| `seedPCConfigurationSystem.ts` | ✅ 62 | ✅ 15 | ✅ 5 | **Fresh setup (recommended)** |

## Support

For issues or questions:
- Check the [main implementation plan](../../../CLAUDE.md)
- Review API documentation in `backend/API_DOCS.md`
- Verify database schema in `backend/DATABASE_SCHEMA.md`

---

**Last Updated:** 2026-01-29
**Seed Data Version:** 1.0
**Total Components:** 62
**Total Rules:** 15
**Total Services:** 5

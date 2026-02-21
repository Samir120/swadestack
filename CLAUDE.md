# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio E-Commerce Platform (M24 Design) - a full-stack web application with separate frontend and backend. Features include services catalog, portfolio showcase, shopping cart with Klarna payments, PC builder with compatibility checking, admin dashboard, and bilingual support (English/Swedish).

## Build & Development Commands

### Frontend (`/frontend`)
```bash
npm run dev          # Development server on http://localhost:5173
npm run build        # TypeScript compile + Vite production build
npm run lint         # ESLint with zero warnings policy (--max-warnings 0)
npm run preview      # Preview production build
```

### Backend (`/backend`)
```bash
npm run dev          # Development server on http://localhost:5000 (ts-node-dev)
npm run build        # TypeScript compile to dist/
npm start            # Production server (node dist/server.js)
npm run lint         # ESLint
npm run format       # Prettier formatting

# Database
npm run db:migrate           # Run pending migrations
npm run db:migrate:undo      # Rollback last migration
npm run db:migrate:status    # Check migration status
npm run db:seed              # Run all seeders

# Email processing
npm run email:process-queue  # Process email queue
npm run email:retry-failed   # Retry failed emails
```

### Development Setup
- Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`
- Vite proxies `/api` requests to the backend automatically
- Copy `.env.example` to `.env` in backend before starting
- No test framework is currently configured

## Architecture

### Frontend - MVVM Pattern
The frontend strictly follows MVVM with three layers:

**VIEW (`src/components/`)** - Pure presentational components
- No business logic, no API calls, no data transformation
- Uses ViewModel hooks for data and actions
- Lazy-loaded routes (except Home page) with Suspense boundaries

**VIEWMODEL (`src/viewmodels/`)** - Business logic layer
- Custom hooks returning `{ state, actions, computed }` objects
- Handles validation, data transformation, Redux orchestration
- Key files: `portfolioViewModel.ts`, `servicesViewModel.ts`, `cartViewModel.ts`, `authViewModel.ts`, `ordersViewModel.ts`

**MODEL (`src/models/`)** - Data layer
- `api/` - HTTP endpoints via `apiClient` wrapper
- `types/` - TypeScript interfaces

**Redux Store (`src/store/`)**
- Feature-based slices in `slices/` (~19 slices)
- Typed hooks in `hooks.ts`
- AsyncThunk for all async operations
- Session rehydration on app startup

**Internationalization** - English (en) and Swedish (sv) via i18next in `src/i18n/`

### Backend - Layered Architecture
```
Routes → Controllers → Services → Repositories/DAOs → Sequelize Models
```

- **Routes** (`src/api/routes/`) - Express route definitions
- **Controllers** (`src/api/controllers/`) - Parse requests, delegate to services
- **Services** (`src/services/`) - Business logic, DTO mapping, validation
- **Repositories** extend **BaseDAO** (`src/dao/`) - Data access abstraction over Sequelize
- **Models** (`src/models/sequelize/`) - Sequelize model definitions; associations in `index.ts`
- **Middleware** (`src/middleware/`) - Auth, error handling, rate limiting, file upload, maintenance mode
- **Templates** (`src/templates/`) - Handlebars email templates

### Database
PostgreSQL with Sequelize ORM. UUID primary keys on all tables. Timestamps on all models. Connection pooling configured. Database configuration uses separate fields (host, port, database, username, password) — not a DATABASE_URL connection string. Database schema syncs automatically via `sequelize.sync({ alter: true })` on every startup — manual migrations are not needed.

## Tech Stack

**Frontend:** React 18, Vite 5, TypeScript, Redux Toolkit, Tailwind CSS, Axios, i18next, Framer Motion

**Backend:** Express 4, TypeScript, Sequelize 6, PostgreSQL, JWT auth, Nodemailer, Puppeteer (PDF generation), Multer (file uploads), Klarna API

## Key Patterns

1. **Frontend data flow:** View → ViewModel hook → Redux dispatch (AsyncThunk) → API call → State update → View re-render
2. **Views are dumb:** Components only render and handle events, delegate everything else to ViewModels
3. **DTO pattern:** All API responses go through DTO mapping in the service layer. Separate Create/Update/Read DTOs.
4. **API client token refresh:** `apiClient.ts` implements a request queue that holds failed 401 requests, refreshes the JWT, then retries them. Access token: 15min, refresh token: 7 days (stored in RefreshToken table).
5. **Auth middleware variants:** `authMiddleware` (required auth), `optionalAuthMiddleware` (continues if invalid), `adminMiddleware` (role check)
6. **UUID primary keys:** All database tables use UUIDs
7. **Bilingual content:** Services, portfolio items, site settings, and legal content have both English (`_en`) and Swedish (`_sv`) fields
8. **File uploads:** Multer with disk storage to `/uploads`, images only (jpg, jpeg, png, gif, webp), 5MB limit
9. **Error response format:** `{ success: boolean, message: string, data?: any }`
10. **Email queue:** Emails are queued in the Email model, processed via `npm run email:process-queue`, with retry for failures
11. **Invoice generation:** Puppeteer renders HTML templates to PDF for order invoices

## Documentation

- `/frontend/FRONTEND_ARCHITECTURE.md` - Detailed MVVM implementation guide
- `/backend/API_DOCS.md` - API endpoint reference
- `/backend/DATABASE_SCHEMA.md` - Database structure

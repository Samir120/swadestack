# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio E-Commerce Platform (M24 Design) - a full-stack web application with separate frontend and backend.

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

## Architecture

### Frontend - MVVM Pattern
The frontend strictly follows MVVM with three layers:

**VIEW (`src/components/`)** - Pure presentational components
- No business logic, no API calls, no data transformation
- Uses ViewModel hooks for data and actions

**VIEWMODEL (`src/viewmodels/`)** - Business logic layer
- Validation, data transformation, Redux orchestration
- Key files: `portfolioViewModel.ts`, `servicesViewModel.ts`, `cartViewModel.ts`, `authViewModel.ts`, `ordersViewModel.ts`

**MODEL (`src/models/`)** - Data layer
- `api/` - HTTP endpoints via apiClient wrapper
- `types/` - TypeScript interfaces

**Redux Store (`src/store/`)**
- Feature-based slices in `slices/`
- Typed hooks in `hooks.ts`

**Internationalization** - English (en) and Swedish (sv) via i18next in `src/i18n/`

### Backend - MVC Pattern
```
Routes (api/routes/) → Controllers (api/controllers/) → Services (services/) → Models (models/sequelize/)
```

**Key directories:**
- `src/api/routes/` - Express route definitions
- `src/api/controllers/` - Request handlers
- `src/models/sequelize/` - Sequelize models (PostgreSQL)
- `src/services/` - Business logic services
- `src/middleware/` - Auth, error handling, rate limiting
- `src/templates/` - Email templates (Handlebars)
- `migrations/` - Sequelize database migrations

### Database
PostgreSQL with Sequelize ORM. Core tables: Users, Services, Orders, OrderItems, PortfolioItems.

## Tech Stack

**Frontend:** React 18, Vite 5, TypeScript, Redux Toolkit, Tailwind CSS, Axios, i18next, Framer Motion

**Backend:** Express 4, TypeScript, Sequelize 6, PostgreSQL, JWT auth, Nodemailer, Puppeteer (PDF)

## Key Patterns

1. **Frontend data flow:** View → ViewModel action → Redux dispatch → State update → View re-render
2. **Views are dumb:** Components only render and handle events, delegate everything else to ViewModels
3. **UUID primary keys:** All database tables use UUIDs
4. **Bilingual content:** Services and portfolio items have both English and Swedish fields
5. **JWT authentication:** Bearer token in Authorization header

## Documentation

- `/frontend/FRONTEND_ARCHITECTURE.md` - Detailed MVVM implementation guide
- `/backend/API_DOCS.md` - API endpoint reference
- `/backend/DATABASE_SCHEMA.md` - Database structure

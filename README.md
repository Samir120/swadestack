# Swadestack - Portfolio & E-Commerce Platform

A bilingual (English/Swedish) portfolio and e-commerce platform with a custom PC builder. Live at [swadestack.com](https://swadestack.com).

## Tech Stack

**Frontend:** React, TypeScript, Redux Toolkit, Tailwind CSS, Vite, i18next, Framer Motion
**Backend:** Node.js, Express, TypeScript, Sequelize, PostgreSQL
**Payments:** Klarna Checkout
**Auth:** JWT + bcrypt + TOTP-based 2FA

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
npm install
cp .env.example .env   # edit with your DB credentials
npm run dev             # tables are auto-created on startup
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev             # runs on http://localhost:5173
```

## Project Structure

```
backend/
  src/
    api/controllers/    # HTTP request handling
    api/routes/         # Route definitions
    services/           # Business logic
    integration/        # Repositories & data access
    models/             # Sequelize models & DTOs
    middleware/          # Auth, error handling, rate limiting
    templates/          # Email templates (Handlebars)

frontend/
  src/
    components/         # React components & pages
    viewmodels/         # Custom hooks with business logic
    models/             # API client, types
    store/              # Redux slices
    i18n/               # Translation files (en, sv)
```

## Key Features

- Services catalog with categories and bilingual content
- Portfolio showcase with image galleries
- Shopping cart with Klarna payment integration
- Custom PC builder with compatibility checking and power estimation
- Pre-configured PC listings
- Two-factor authentication (TOTP)
- Bilingual support (English + Swedish)
- Admin dashboard for managing services, orders, portfolio, and site settings
- Email notifications with templated layouts
- Invoice PDF generation
- Responsive design with dark mode

## Scripts

| Directory  | Command           | Description                       |
|------------|-------------------|-----------------------------------|
| `backend`  | `npm run dev`     | Dev server with hot reload        |
| `backend`  | `npm run build`   | Compile TypeScript for production |
| `backend`  | `npm start`       | Run production build              |
| `backend`  | `npm run db:seed` | Seed database                     |
| `frontend` | `npm run dev`     | Vite dev server                   |
| `frontend` | `npm run build`   | Production build                  |

## Deployment

```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm run build && pm2 restart swadestack
```

## License

MIT

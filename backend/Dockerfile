# ---------- Build stage ----------
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY . .

RUN npm run build


# ---------- Production dependencies ----------
FROM node:22-bookworm-slim AS prod-deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev


# ---------- Runtime ----------
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Libraries required by Chromium/Puppeteer at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

COPY package*.json ./

# Sequelize CLI configuration/migrations are required by the migration Job
COPY config ./config
COPY migrations ./migrations

# Include these only if present in your backend
COPY seeders ./seeders
COPY templates ./templates

RUN mkdir -p /app/uploads \
    && chown -R node:node /app

USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]

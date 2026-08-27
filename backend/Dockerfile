# ---------- Build ----------
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ---------- Production dependencies ----------
FROM node:22-bookworm-slim AS prod-deps

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./
RUN npm ci --omit=dev


# ---------- Runtime ----------
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       chromium \
       ca-certificates \
       fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

COPY package*.json ./
COPY config ./config
COPY migrations ./migrations
COPY .sequelizerc ./

RUN mkdir -p /app/uploads \
    && chown -R node:node /app

USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]

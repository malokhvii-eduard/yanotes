FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2.10-alpine AS runtime

COPY config/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
  CMD wget -q -O /dev/null http://127.0.0.1/favicon.svg || exit 1

EXPOSE 80

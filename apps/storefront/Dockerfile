FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
WORKDIR /app/apps/storefront
EXPOSE 3000
CMD ["pnpm", "dev"]

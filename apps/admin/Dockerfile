FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
WORKDIR /app/apps/admin
EXPOSE 3001
CMD ["pnpm", "dev"]

# 1) Dependencies
FROM node:22-alpine AS deps
RUN npm i -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 2) Build
FROM node:22-alpine AS build
RUN npm i -g pnpm
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_URL

RUN pnpm run build 

# 3) Runtime
FROM node:22-alpine AS runner
RUN npm i -g pnpm
WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build

EXPOSE 3000
CMD ["pnpm", "start"] 
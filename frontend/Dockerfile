# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 设置构建时环境变量（避免 Prisma 初始化错误）
ENV DATABASE_URL="postgresql://dummy:password@localhost:5432/dummy"

# 安装系统依赖（canvas等原生模块需要）
RUN apk add --no-cache \
    python3 \
    pkgconfig \
    cairo-dev \
    pango-dev \
    libjpeg-turbo-dev \
    giflib-dev \
    librsvg-dev \
    build-base \
    g++ \
    make

# 复制依赖文件
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# 复制 Prisma schema（postinstall 会执行 prisma generate，需先有 schema）
COPY prisma ./prisma

# 安装依赖（使用npm ci确保与lockfile一致）
RUN npm ci

# 复制源码
COPY . .

RUN npm run build

# 运行阶段
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 安装运行时依赖（canvas需要）
RUN apk add --no-cache \
    cairo \
    pango \
    libjpeg-turbo \
    giflib \
    librsvg

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# gosu已移除，不再需要用户切换

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Prisma migrate 需完整 CLI 及依赖链，复制 node_modules（镜像略大但可靠）
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
# .next 需可写（Next.js 运行时会创建 .next/cache）
RUN chown -R 1001:1001 /app/.next
# entrypoint 需 root 执行 chown uploads，随后 su 到 nextjs 运行应用
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER root

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/entrypoint.sh"]

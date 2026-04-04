#!/bin/sh
set -e  # 任何命令失败则退出


echo "🔧 启动容器初始化..."

# 1. 数据库迁移
echo "🗄️  运行数据库迁移..."
npx prisma migrate deploy

# 2. 种子脚本（根据环境变量决定）
echo "🌱 检查种子脚本执行条件..."
echo "环境变量: RUN_SEED=$RUN_SEED, NODE_ENV=$NODE_ENV"
if [ "$RUN_SEED" = "true" ] || [ "$NODE_ENV" = "development" ]; then
  echo "执行数据库种子脚本..."
  npm run db:seed
else
  echo "跳过种子脚本"
fi

# 3. 启动应用
echo "🚀 启动 Next.js 应用..."
exec node server.js

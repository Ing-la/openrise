#!/bin/sh
# 确保 uploads  volume 可写（volume 挂载后可能为 root 拥有）
chown -R nextjs:nodejs /app/public/uploads 2>/dev/null || true
exec su -s /bin/sh nextjs -c "npx prisma migrate deploy && node server.js"

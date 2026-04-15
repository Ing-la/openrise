# 开发环境快速指南

## 🚀 快速开始

### 前置要求
- Docker 和 Docker Compose
- Node.js 18+ 和 npm
- Git

### 一键启动（推荐）
使用 PowerShell 脚本一键启动所有服务：
```powershell
.\start-dev.ps1
```

### 手动启动步骤
```bash
# 1. 启动数据库和 MinIO
docker-compose up -d db minio

# 2. 等待服务就绪（约30秒）
# 检查数据库：docker-compose exec db pg_isready -U openrise -d openrise
# 检查 MinIO：curl http://localhost:9000/minio/health/live

# 3. 启动前端开发服务器
cd frontend
npm install  # 如果依赖未安装
npm run dev
```

### 访问服务
- **前端应用**: http://localhost:3000
- **数据库**: localhost:5432 (用户: openrise, 密码: openrise_secret)
- **MinIO API**: localhost:9000
- **MinIO 控制台**: http://localhost:9001 (账号: minioadmin / minioadmin)

## 🔧 常用命令

### 开发工作流
```bash
# 启动开发环境（使用脚本）
.\start-dev.ps1

# 仅启动基础设施
.\start-dev.ps1 -SkipFrontend

# 仅启动前端（假设容器已在运行）
.\start-dev.ps1 -SkipDocker

# 停止所有容器
docker-compose down

# 查看容器日志
docker-compose logs -f
```

### 前端开发
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

### 数据库操作
```bash
# 生成 Prisma 客户端
npx prisma generate

# 创建数据库迁移
npx prisma migrate dev --name your-migration-name

# 查看数据库状态
npx prisma migrate status

# 打开 Prisma Studio（数据库管理界面）
npm run studio
```

### MinIO 对象存储
```bash
# 初始化 MinIO 存储桶（首次运行需要）
docker-compose exec minio mc alias set myminio http://localhost:9000 minioadmin minioadmin
docker-compose exec minio mc mb myminio/uploads
docker-compose exec minio mc policy set public myminio/uploads

# 查看存储桶内容
docker-compose exec minio mc ls myminio/uploads
```

### 环境配置
```bash
# 复制环境变量模板
cp .env.example .env                    # 根目录 Docker 变量
cp frontend/.env.example frontend/.env.local  # 前端开发变量

# 编辑环境变量
# 根目录 .env 用于 Docker 容器
# frontend/.env.local 用于本地开发
```

## ⚡ 快捷脚本

项目根目录包含以下便捷脚本：

### `start-dev.ps1` - 一键启动脚本
```powershell
# 正常启动所有服务
.\start-dev.ps1

# 仅启动容器
.\start-dev.ps1 -SkipFrontend

# 仅启动前端
.\start-dev.ps1 -SkipDocker

# 显示帮助
.\start-dev.ps1 -Help
```

## 🐛 快速排错

### 常见问题
1. **数据库连接失败**
   - 检查 PostgreSQL 是否运行：`docker-compose ps db`
   - 验证连接字符串：`DATABASE_URL="postgresql://openrise:openrise_secret@localhost:5432/openrise"`

2. **MinIO 连接失败**
   - 检查 MinIO 是否运行：`docker-compose ps minio`
   - 验证控制台：http://localhost:9001

3. **前端环境变量不生效**
   - 确保 `frontend/.env.local` 文件存在且格式正确
   - 重启前端开发服务器

### 获取更多帮助
详细文档请参考：
- `docs/project-architecture.md` - 项目架构
- `docs/codebase-guide.md` - 代码库指南

---

**提示**: 部署到生产环境前，务必在本地充分测试所有修改！
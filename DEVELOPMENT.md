# OpenRise 本地开发指南

本文档描述如何在本地设置开发环境，进行前后端修改，并安全地部署到生产环境。

## 🚀 快速开始

### 1. 前置要求
- Docker 和 Docker Compose
- Node.js 18+ 和 npm
- Git

### 2. 启动开发环境

#### 启动步骤
```bash
# 1. 启动数据库和 MinIO
docker-compose up -d db minio

# 2. 等待服务就绪（约30秒）
# 检查数据库：docker-compose exec db pg_isready -U openrise -d openrise
# 检查 MinIO：curl http://localhost:9000/minio/health/live

# 3. 初始化 MinIO 存储桶（首次运行需要）
docker-compose exec minio mc alias set myminio http://localhost:9000 minioadmin minioadmin
docker-compose exec minio mc mb myminio/uploads
docker-compose exec minio mc policy set public myminio/uploads

# 4. 启动前端开发服务器
cd frontend
npm install  # 如果依赖未安装
npm run dev
```


### 3. 访问服务
- **前端应用**: http://localhost:3000
- **数据库**: localhost:5432 (用户: openrise, 密码: openrise_secret)
- **MinIO API**: localhost:9000
- **MinIO 控制台**: http://localhost:9001 (账号: minioadmin / minioadmin)

## ⚙️ 环境配置

### 开发环境变量
- `.env.development` - Docker Compose 开发环境变量
- `frontend/.env.development` - 前端开发环境变量
- `frontend/.env.local` - 前端本地覆盖变量（优先级最高）

### 生产环境变量
- **重要**: 生产环境变量存储在服务器上，不应提交到 Git
- 参考 `frontend/.env.production.example` 创建生产环境配置
- 服务器配置位于 `/root/ing/openrise/.env`

## 🔧 开发工作流

### 修改前端代码
1. 确保开发环境正在运行（数据库 + MinIO）
2. 在 `frontend/` 目录中运行 `npm run dev`
3. 代码更改将自动热重载
4. 访问 http://localhost:3000 测试修改

### 修改后端代码（API Routes）
1. Next.js API Routes 位于 `frontend/app/api/`
2. 修改后会自动重新加载
3. 无需重启 Docker 容器

### 数据库修改
1. 更新 `frontend/prisma/schema.prisma`
2. 生成迁移：`npx prisma migrate dev --name your-migration-name`
3. 迁移会自动应用到开发数据库

### 文件上传测试
1. 开发环境使用本地 MinIO 实例
2. 上传的文件存储在 MinIO `uploads` 存储桶
3. 通过 http://localhost:3000/uploads/ 访问上传的文件
4. 重写规则在 `next.config.ts` 中配置

## 🚢 部署到生产环境

### 安全部署流程（推荐）

#### 方法一：Git 工作流（最安全）
```bash
# 1. 提交更改到 Git
git add .
git commit -m "描述你的修改"
git push origin your-branch

# 2. 服务器端更新
ssh tao "cd ~/ing/openrise && git fetch && git checkout your-branch"

# 3. 重建并重启服务
ssh tao "cd ~/ing/openrise && docker-compose down && docker-compose up -d --build"
```

#### 方法二：安全 SCP 部署
```bash
# 1. 创建部署排除清单
cat > deploy-exclude.txt << EOF
.env
.env.example
nginx/nginx.conf
frontend/next.config.ts
frontend/public/uploads/
docs/resource/
*.backup
EOF

# 2. 同步代码（排除配置文件）
scp -r --exclude-from=deploy-exclude.txt ./ tao:/root/ing/openrise/

# 3. 服务器端构建
ssh tao "cd ~/ing/openrise/frontend && npm ci && npm run build"
ssh tao "cd ~/ing/openrise && docker-compose up -d --build frontend"
```

### 部署前检查清单
- [ ] 备份服务器当前状态
- [ ] 验证数据库迁移脚本 `npx prisma migrate status`
- [ ] 测试 MinIO 连接
- [ ] 保留生产环境配置文件（`.env`, `nginx.conf`, `next.config.ts`）
- [ ] 保留用户上传的文件

## 🐛 故障排除

### 常见问题

#### 1. 数据库连接失败
- 检查 PostgreSQL 是否运行：`docker-compose ps db`
- 验证连接字符串：`DATABASE_URL="postgresql://openrise:openrise_secret@localhost:5432/openrise"`
- 检查端口是否被占用

#### 2. MinIO 连接失败
- 检查 MinIO 是否运行：`docker-compose ps minio`
- 验证控制台：http://localhost:9001
- 检查存储桶权限：`docker-compose exec minio mc policy get myminio/uploads`

#### 3. 文件上传不工作
- 检查 `next.config.ts` 中的重写规则
- 验证 MinIO 存储桶存在且为公开
- 检查浏览器控制台是否有 CORS 错误

#### 4. 环境变量不生效
- 确保 `.env.development` 文件存在且格式正确
- 重启前端开发服务器
- 检查变量名是否与代码中一致

### 调试工具
```bash
# 查看 Docker 容器日志
docker-compose logs -f

# 检查前端构建
cd frontend && npm run build

# 检查 Prisma 连接
npx prisma studio
```

## 📁 项目结构

```
openrise/
├── .env.development          # 开发环境变量（Docker）
├── docker-compose.yml        # 主 Docker 配置
├── docker-compose.override.yml # 开发环境覆盖
├── frontend/
│   ├── .env.development      # 前端开发环境变量
│   ├── .env.local            # 前端本地覆盖
│   ├── .env.production.example # 生产环境示例
│   ├── next.config.ts        # Next.js 配置（包含开发重写规则）
│   └── prisma/               # 数据库 ORM
└── DEVELOPMENT.md            # 本文档
```

## 🔄 与生产环境的差异

本地开发环境与生产环境的主要差异：

| 组件 | 开发环境 | 生产环境 |
|------|----------|----------|
| 前端运行方式 | `npm run dev` (主机) | Docker 容器 |
| 数据库主机 | `localhost:5432` | `db:5432` (容器网络) |
| MinIO 端点 | `localhost:9000` | `minio:9000` (容器网络) |
| Nginx | 禁用 | 启用（反向代理） |
| 环境变量 | `.env.development` | 服务器 `.env` |
| 文件上传 | 本地 MinIO | 生产 MinIO |

## 📞 获取帮助

### 项目文档
详细的技术文档位于 `docs/` 目录：

1. **[项目架构](docs/project-architecture.md)** - 系统架构、技术栈、服务设计
2. **[代码库指南](docs/codebase-guide.md)** - 代码组织、修改模式、开发工作流  
3. **[UI功能开关](docs/ui-feature-flags.md)** - 条件渲染、功能开关管理

### 故障排除
1. 检查服务器日志：`ssh tao "cd ~/ing/openrise && docker-compose logs -f"`
2. 对比生产配置：参考之前的差异分析报告
3. 查看前端开发服务器控制台输出

---

**重要提示**: 部署到生产环境前，务必在本地充分测试所有修改！
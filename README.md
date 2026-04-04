# OpenRise - AI Web Community

用 AI 帮助普通人成长。零门槛学习，场景实战，从「会聊天」到「会应用」。

## 功能概览

### 已实现

| 模块 | 功能 |
|------|------|
| **认证** | 注册 / 登录、邮箱验证、忘记密码、JWT 会话（30 天） |
| **个人中心** | 编辑讲师信息（头像、昵称、职位、简介）、创建课程 |
| **课程管理** | 章节与小节（视频链接 / Markdown 文档）、拖入 .md 文件 |
| **案例库** | 静态案例 + 用户创建课程、场景筛选、课程详情 |
| **内容访问** | 未登录可浏览课程与小节（视频、Markdown 渲染含表格） |
| **文件存储** | MinIO 对象存储（S3兼容），彻底解决 Docker 权限问题 |
| **数据库** | PostgreSQL + Prisma ORM，自动迁移和种子脚本 |
| **部署** | Docker Compose 多服务编排，Nginx 反向代理 |
| **安全** | 蜜罐防机器人、密码 bcrypt 加密、安全文件上传 |

### 待办

- 人机验证（Cloudflare Turnstile）
- 课程发布 / 私密状态
- 社区、定价、资源页

## 技术栈

- **前端**：Next.js 16、React 19、TypeScript、Tailwind CSS 4
- **后端**：Next.js API Routes、Prisma、PostgreSQL
- **认证**：NextAuth、Resend 邮件
- **文件存储**：MinIO（S3兼容对象存储）、AWS SDK v3
- **容器化**：Docker、Docker Compose
- **反向代理**：Nginx
- **数据库**：PostgreSQL 15

## 快速开始

### Docker 部署（推荐）

项目使用 Docker Compose 编排所有服务，一键启动：

```bash
# 1. 克隆项目
git clone https://github.com/Ing-la/openrise.git
cd openrise

# 2. 配置环境变量
cp .env.example .env
cp frontend/.env.example frontend/.env
# 编辑 .env 文件，根据需要修改数据库密码等配置

# 3. 构建并启动所有服务
docker-compose up -d --build

# 4. 验证服务状态
docker-compose ps

# 5. 访问应用
# 前端：http://localhost:3000
# Nginx（推荐）：http://localhost
# MinIO 管理控制台：http://localhost:9001 (账号：minioadmin/minioadmin)
```

### 数据库种子脚本

首次启动后，系统会自动创建官方示例账号：

- **官方账号**：`01builder@openrise.com`
- **密码**：`01builder_password_123`
- **功能**：平台管理员，包含 9 个示例课程

如需重新初始化数据，运行：
```bash
docker-compose exec frontend npm run db:seed
```

### 本地开发模式

如需前端热重载开发：

```bash
# 1. 启动依赖服务
docker-compose up db minio -d

# 2. 前端开发环境
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

## 服务架构

项目采用 Docker Compose 多服务架构：

```
┌─────────────────────────────────────────────────────────┐
│                    用户访问                             │
│                   http://localhost                      │
└──────────────────────────┬──────────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │   Nginx (80)    │ 反向代理
                  └────────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐ ┌────────▼────────┐ ┌───────▼──────┐
│  Frontend    │ │   MinIO (9000)  │ │     DB      │
│  Next.js     │ │  对象存储/S3    │ │ PostgreSQL  │
│  (3000)      │ │  /uploads/ 代理 │ │   (5432)    │
└──────────────┘ └─────────────────┘ └──────────────┘
```

### 服务说明
| 服务 | 端口 | 功能 |
|------|------|------|
| **Nginx** | 80 | 反向代理，统一访问入口，代理前端和MinIO请求 |
| **Frontend** | 3000 | Next.js应用（前端页面 + API路由） |
| **MinIO** | 9000/9001 | 对象存储（S3兼容），文件上传存储 |
| **PostgreSQL** | 5432 | 关系型数据库，数据持久化 |

### 网络架构
- 所有服务通过 `app-network` Docker网络互联
- Nginx将 `/uploads/` 路径代理到MinIO服务
- 前端通过内部DNS名称访问数据库 (`db:5432`) 和MinIO (`minio:9000`)

## 项目结构

```
ai-web-community/
├── frontend/                  # Next.js 应用
│   ├── app/                   # 页面与 API
│   │   ├── account/           # 个人中心、课程管理、小节
│   │   ├── courses/           # 案例库、课程详情
│   │   └── api/               # API 路由（认证、课程、上传等）
│   ├── components/            # React 组件
│   ├── lib/                   # 工具函数和配置
│   │   ├── s3.ts              # MinIO/S3 客户端配置
│   │   └── courses.ts         # 课程数据定义
│   ├── prisma/                # 数据库 ORM
│   │   ├── schema.prisma      # 数据模型
│   │   ├── migrations/        # 数据库迁移
│   │   └── seed.ts            # 数据库种子脚本
│   ├── public/                # 静态资源
│   │   └── images/            # 课程封面、头像等静态图片
│   └── package.json
├── nginx/                     # 反向代理配置
│   └── nginx.conf             # Nginx 配置（代理前端和 MinIO）
├── docs/                      # 项目文档
│   ├── docker-volume-permissions-guide.md
│   └── object-storage-options-guide.md
├── docker-compose.yml         # 多服务 Docker 编排
├── .env.example               # 环境变量模板
└── README.md                  # 项目说明
```

## 环境变量

### 数据库配置
| 变量 | 说明 | 默认值 |
|------|------|--------|
| `POSTGRES_USER` | PostgreSQL 用户名 | `openrise` |
| `POSTGRES_PASSWORD` | PostgreSQL 密码 | `openrise_secret` |
| `POSTGRES_DB` | PostgreSQL 数据库名 | `openrise` |
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://openrise:openrise_secret@db:5432/openrise` |

### 应用配置
| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NEXTAUTH_SECRET` | NextAuth 密钥（生产环境务必更换） | `change-me-in-production` |
| `NEXTAUTH_URL` | 应用地址 | `http://localhost` |
| `RESEND_API_KEY` | Resend 邮件 API Key | 空 |
| `RESEND_FROM` | 发件人邮箱 | `OpenRise <onboarding@resend.dev>` |
| `RUN_SEED` | 是否运行数据库种子脚本 | `false` |

### MinIO 对象存储配置
| 变量 | 说明 | 默认值 |
|------|------|--------|
| `MINIO_ROOT_USER` | MinIO 管理员账号 | `minioadmin` |
| `MINIO_ROOT_PASSWORD` | MinIO 管理员密码 | `minioadmin` |
| `MINIO_ENDPOINT` | MinIO 服务地址 | `http://minio:9000` |
| `MINIO_ACCESS_KEY` | S3 访问密钥 | `minioadmin` |
| `MINIO_SECRET_KEY` | S3 私密密钥 | `minioadmin` |
| `MINIO_BUCKET` | 存储桶名称 | `uploads` |
| `MINIO_REGION` | 存储区域 | 空 |
| `MINIO_USE_SSL` | 是否使用 SSL | `false` |

完整配置见 `.env.example` 和 `frontend/.env.example`

## 部署说明

### 数据持久化
- **数据库**：PostgreSQL 数据通过 Docker volume `db_data` 持久化
- **对象存储**：MinIO 数据通过 Docker volume `minio_data` 持久化

### 文件存储架构
项目使用 **MinIO 对象存储** 替代本地文件系统，彻底解决 Docker 容器权限问题：
- 用户上传的头像、课程封面存储在 MinIO 的 `uploads` 桶中
- 前端通过 `/uploads/` 路径访问文件，由 Nginx 代理到 MinIO 服务
- 静态图片（示例课程封面）位于 `frontend/public/images/` 目录

### MinIO 管理
- **管理控制台**：http://localhost:9001
- **默认账号**：`minioadmin` / `minioadmin`
- **S3 API 端点**：http://localhost:9000
- **存储桶**：`uploads`（自动创建）

### 生产环境建议
- **HTTPS**：生产环境建议在 Nginx 配置 SSL 证书
- **密码安全**：务必修改所有默认密码（数据库、MinIO、NextAuth）
- **备份策略**：定期备份数据库 volume 和 MinIO volume
- **监控**：配置服务健康检查和日志收集

## License

MIT

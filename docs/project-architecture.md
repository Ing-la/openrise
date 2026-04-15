# OpenRise 项目架构文档

## 概述

OpenRise 是一个 AI 赋能的教育社区平台，帮助普通人通过场景化实战掌握 AI 应用能力。项目采用全栈 JavaScript/TypeScript 架构，基于 Docker Compose 多服务编排。

**核心理念**：零门槛学习，场景实战，从「会聊天」到「会应用」

## 技术栈

### 前端层
- **框架**: Next.js 16 (App Router)
- **UI 库**: React 19 + TypeScript
- **样式**: Tailwind CSS 4
- **状态管理**: React 状态 + 服务端组件

### 后端层
- **API**: Next.js API Routes (Node.js)
- **ORM**: Prisma (PostgreSQL)
- **认证**: NextAuth.js (JWT + 邮箱验证)
- **文件存储**: MinIO (S3兼容对象存储)

### 基础设施
- **容器化**: Docker + Docker Compose
- **数据库**: PostgreSQL 15
- **对象存储**: MinIO
- **反向代理**: Nginx
- **邮件服务**: Resend

### 开发工具
- **包管理**: npm
- **数据库迁移**: Prisma Migrate
- **类型安全**: TypeScript
- **代码规范**: ESLint

## 服务架构

### Docker Compose 多服务架构

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

| 服务 | 端口 | 功能 | 内部DNS |
|------|------|------|---------|
| **Nginx** | 80 | 反向代理，统一访问入口，代理前端和MinIO请求 | nginx |
| **Frontend** | 3000 | Next.js应用（前端页面 + API路由） | frontend |
| **MinIO** | 9000/9001 | 对象存储（S3兼容），文件上传存储 | minio |
| **PostgreSQL** | 5432 | 关系型数据库，数据持久化 | db |

### 网络架构
- 所有服务通过 `app-network` Docker网络互联
- Nginx将 `/uploads/` 路径代理到MinIO服务
- 前端通过内部DNS名称访问数据库 (`db:5432`) 和MinIO (`minio:9000`)

## 数据流架构

### 1. 用户请求流程
```
用户请求 → Nginx (80) → 前端Next.js (3000) → API路由处理 → 数据库/文件存储
```

### 2. 文件上传流程
```
前端上传 → API路由 → MinIO SDK → MinIO存储桶 → Nginx代理访问 (/uploads/)
```

### 3. 认证流程
```
用户登录 → NextAuth.js → JWT生成 → 会话管理 → 邮箱验证 (可选)
```

## 目录结构

```
ai-web-community/
├── frontend/                  # Next.js 应用（主代码库）
│   ├── app/                   # App Router 页面与API
│   │   ├── account/           # 个人中心、课程管理、小节
│   │   ├── api/               # API 路由（认证、课程、上传等）
│   │   ├── courses/           # 案例库、课程详情
│   │   ├── login/             # 登录页面
│   │   ├── register/          # 注册页面
│   │   └── page.tsx           # 首页（包含UI功能开关）
│   ├── components/            # React 组件库
│   │   ├── AuthButton.tsx     # 认证按钮组件
│   │   ├── CollapsibleChapter.tsx # 可折叠章节组件
│   │   └── providers.tsx      # 上下文提供者
│   ├── lib/                   # 工具函数和配置
│   │   ├── auth.ts            # 认证工具函数
│   │   ├── courses.ts         # 课程数据定义和服务
│   │   ├── prisma.ts          # 数据库客户端
│   │   ├── s3.ts              # MinIO/S3 客户端配置
│   │   └── video.ts           # 视频处理工具
│   ├── prisma/                # 数据库ORM层
│   │   ├── schema.prisma      # 数据模型定义
│   │   ├── migrations/        # 数据库迁移文件
│   │   └── seed.ts            # 数据库种子脚本
│   ├── public/                # 静态资源
│   │   ├── images/            # 课程封面、头像等静态图片
│   │   └── uploads/           # 本地开发时上传文件缓存（已弃用，使用MinIO）
│   └── package.json           # 依赖配置
├── nginx/                     # 反向代理配置
│   └── nginx.conf             # Nginx配置文件
├── db/                        # 数据库相关文件
├── minio/                     # MinIO对象存储配置
├── docs/                      # 项目文档（本文档所在目录）
├── .env                       # 开发环境变量（不提交）
├── .env.example               # 环境变量模板（提交）
├── .env.production            # 生产环境变量示例（不提交）
├── docker-compose.yml         # 主Docker编排配置
├── docker-compose.override.yml # 开发环境覆盖配置
├── DEV_GUIDE.md               # 开发指南
├── start-dev.ps1              # 一键启动脚本（Windows）
└── README.md                  # 项目说明
```

## 数据模型

### 核心实体

1. **User** - 用户账户
   - 邮箱、密码、昵称、头像、角色
   - 邮箱验证状态、密码重置令牌

2. **Course** - 课程
   - 标题、描述、封面图、Slug、创建者
   - 公开/私有状态、难度等级、时长

3. **Chapter** - 课程章节
   - 标题、排序位置、所属课程

4. **Lesson** - 课程小节
   - 标题、内容类型（视频/Markdown）、内容数据
   - 排序位置、所属章节

### 关系
- User 1:n Course (用户创建课程)
- Course 1:n Chapter (课程包含章节)
- Chapter 1:n Lesson (章节包含小节)

## 配置管理

### 环境变量层级

1. **Docker层** (`.env`, `.env.example`)
   - 数据库连接、MinIO配置、服务端口（`.env` 不提交，`.env.example` 为模板）

2. **前端层** (`frontend/.env.local`, `frontend/.env.example`)
   - NextAuth密钥、API端点、功能开关（`.env.local` 不提交，`.env.example` 为模板）

3. **生产层** (服务器上单独配置)
   - 安全密钥、生产数据库连接、邮件服务配置

### 关键配置
- `DATABASE_URL`: PostgreSQL连接字符串
- `NEXTAUTH_SECRET`: 认证加密密钥
- `MINIO_ENDPOINT`: MinIO服务地址
- `NEXTAUTH_URL`: 应用基准URL

## 开发与生产差异

| 组件 | 开发环境 | 生产环境 |
|------|----------|----------|
| 前端运行方式 | `npm run dev` (主机) | Docker容器 |
| 数据库主机 | `localhost:5432` | `db:5432` (容器网络) |
| MinIO端点 | `localhost:9000` | `minio:9000` (容器网络) |
| Nginx | 禁用 | 启用（反向代理） |
| 环境变量 | `.env` (本地开发) | 服务器 `.env` (生产) |
| 文件上传 | 本地MinIO | 生产MinIO |

## 扩展性设计

### 水平扩展
1. **前端无状态**: Next.js应用可水平扩展
2. **数据库连接池**: Prisma配置连接池
3. **对象存储**: MinIO支持分布式部署

### 垂直扩展
1. **API路由分离**: 未来可将API拆分为独立服务
2. **缓存层**: 可添加Redis缓存
3. **CDN**: 静态资源可通过CDN分发

## 安全性设计

1. **认证安全**: JWT + 邮箱验证 + 密码bcrypt加密
2. **文件上传**: 类型检查 + 大小限制 + 安全存储
3. **数据库安全**: 参数化查询防止SQL注入
4. **环境隔离**: 开发/生产环境分离
5. **敏感信息**: 环境变量管理，不提交密钥

---

**文档版本**: 1.0  
**最后更新**: 2026-04-09  
**维护者**: Claude Code Assistant
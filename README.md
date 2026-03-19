# OpenRise

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
| **安全** | 蜜罐防机器人、密码 bcrypt 加密 |

### 待办

- 人机验证（Cloudflare Turnstile）
- 课程发布 / 私密状态
- 社区、定价、资源页

## 技术栈

- **前端**：Next.js 16、React 19、TypeScript、Tailwind CSS 4
- **后端**：Next.js API Routes、Prisma、PostgreSQL
- **认证**：NextAuth、Resend 邮件

## 快速开始

### 本地开发

```bash
# 1. 启动数据库
docker-compose up db -d

# 2. 配置环境变量
cp frontend/.env.example frontend/.env
# 编辑 frontend/.env，配置 DATABASE_URL、NEXTAUTH_*、RESEND_* 等

# 3. 数据库迁移
cd frontend && npx prisma migrate dev

# 4. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### Docker 部署

```bash
# 1. 配置环境变量
cp .env.example .env
cp frontend/.env.example frontend/.env
# 修改 .env 中的 POSTGRES_PASSWORD、NEXTAUTH_URL 等

# 2. 构建并启动
docker-compose up -d --build

# 3. 验证
# 访问 http://localhost
```

详见 [docs/3-三容器部署说明.md](docs/3-三容器部署说明.md)

## 项目结构

```
ai-web-community/
├── frontend/           # Next.js 应用
│   ├── app/            # 页面与 API
│   │   ├── account/    # 个人中心、课程管理、小节
│   │   ├── courses/    # 案例库、课程详情
│   │   └── api/        # API 路由
│   ├── components/
│   ├── lib/
│   └── prisma/
├── nginx/              # 反向代理配置
├── docs/               # 文档
├── docker-compose.yml
└── .env.example
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接串 |
| `NEXTAUTH_SECRET` | NextAuth 密钥（生产环境务必更换） |
| `NEXTAUTH_URL` | 应用地址（如 `https://yourdomain.com`） |
| `RESEND_API_KEY` | Resend 邮件 API Key |
| `RESEND_FROM` | 发件人邮箱 |

完整说明见 `frontend/.env.example`

## 部署说明

- **上传目录**：用户头像、课程封面存储在 `public/uploads/`，Docker 部署时通过 volume 持久化
- **数据库**：PostgreSQL 数据通过 volume 持久化
- **HTTPS**：生产环境建议在 nginx 配置 SSL

## License

MIT

# 代码库指南：理解与修改 OpenRise

## 概述

本文档为开发者和 AI Agent 提供 OpenRise 代码库的详细指南，帮助快速理解项目结构、代码模式和常见修改场景。

**目标读者**：
- 新加入的开发者
- AI 代码助手（如 Claude Code）
- 需要维护代码的技术人员

## 代码组织哲学

### 1. 分层架构
- **展示层**: React 组件 (`app/`, `components/`)
- **业务逻辑层**: 服务函数 (`lib/`)
- **数据访问层**: Prisma ORM (`prisma/`)
- **基础设施层**: 配置和工具 (`config/`, 环境变量)

### 2. 按功能组织
- 认证相关: `app/login/`, `app/register/`, `lib/auth.ts`
- 课程相关: `app/courses/`, `app/account/courses/`, `lib/courses.ts`
- 文件上传: `app/api/upload/`, `lib/s3.ts`

### 3. 约定优于配置
- API路由: `app/api/[endpoint]/route.ts`
- 页面组件: `app/[page]/page.tsx`
- 布局组件: `app/[section]/layout.tsx`

## 核心文件解析

### 1. 首页 (`app/page.tsx`)
**位置**: `frontend/app/page.tsx`  
**作用**: 应用入口页面，展示平台核心价值  
**关键特性**:
- 动态获取精选课程
- 条件渲染功能开关（定价、会员CTA）
- 响应式布局设计

**修改提示**:
- 添加新功能区块时遵循现有样式
- 使用条件渲染控制功能显示
- 数据库失败时使用默认数据回退

### 2. 认证配置 (`lib/auth.ts`)
**位置**: `frontend/lib/auth.ts`  
**作用**: NextAuth.js 配置和会话管理  
**关键配置**:
- JWT 策略（30天有效期）
- 邮箱验证流程
- 密码重置集成

**修改提示**:
- 修改会话时长需更新JWT配置
- 添加新OAuth提供商需配置相应环境变量
- 生产环境必须更换 `NEXTAUTH_SECRET`

### 3. 数据库模型 (`prisma/schema.prisma`)
**位置**: `frontend/prisma/schema.prisma`  
**作用**: 定义数据模型和数据库关系  
**核心模型**:
- `User`: 用户账户
- `Course`: 课程
- `Chapter`: 章节
- `Lesson`: 小节

**修改提示**:
- 修改后需生成迁移: `npx prisma migrate dev --name description`
- 字段注释使用 `///` 三斜线语法
- 关系定义使用 `@relation` 装饰器

### 4. MinIO/S3 配置 (`lib/s3.ts`)
**位置**: `frontend/lib/s3.ts`  
**作用**: 对象存储客户端配置和文件操作  
**关键功能**:
- 文件上传到 MinIO
- 生成预签名URL
- 存储桶管理

**修改提示**:
- 开发环境使用 `localhost:9000`
- 生产环境使用容器网络 `minio:9000`
- 文件通过Nginx代理访问 (`/uploads/`)

## 常见修改场景

### 场景1: 添加新页面

**步骤**:
1. 创建页面文件: `app/new-page/page.tsx`
2. 添加页面内容（使用现有组件模式）
3. 可选：添加到导航 (`app/page.tsx` 或 `app/layout.tsx`)
4. 可选：创建API端点 `app/api/new-endpoint/route.ts`

**示例模板**:
```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '新页面标题',
};

export default function NewPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">页面标题</h1>
      {/* 页面内容 */}
    </div>
  );
}
```

### 场景2: 修改现有功能

**流程**:
1. 定位相关文件（使用 `grep` 搜索关键词）
2. 理解当前实现逻辑
3. 小步修改，频繁测试
4. 保持向后兼容性（如需要）

**定位工具**:
```bash
# 搜索组件引用
grep -r "ComponentName" frontend/app/

# 搜索API端点
grep -r "route.ts" frontend/app/api/

# 搜索样式类名
grep -r "bg-primary" frontend/
```

### 场景3: 添加功能开关

**模式**:
```tsx
// 1. 定义开关变量
const showNewFeature = false; // 或从环境变量读取

// 2. 条件渲染
{showNewFeature && (
  <NewFeatureComponent />
)}

// 3. 未来扩展：环境变量控制
const showNewFeature = process.env.NEXT_PUBLIC_SHOW_NEW_FEATURE === 'true';
```

**最佳实践**:
- 记录开关到 `docs/ui-feature-flags.md`
- 使用描述性变量名
- 考虑开关的层级（用户级、环境级、时间级）

### 场景4: 数据库修改

**流程**:
1. 修改 `prisma/schema.prisma`
2. 生成迁移: `npx prisma migrate dev --name "add_new_field"`
3. 更新相关业务逻辑
4. 更新种子脚本（如需要）

**迁移安全**:
- 测试迁移在空数据库上的执行
- 备份生产数据前进行迁移
- 考虑字段默认值和约束

## 开发工作流

### 1. 本地开发
```bash
# 启动依赖服务
docker-compose up -d db minio

# 前端开发服务器
cd frontend
npm run dev

# 访问 http://localhost:3000
```

**一键启动脚本（Windows）**：
对于 Windows 开发环境，可以使用项目根目录的 PowerShell 脚本：
```powershell
.\start-dev.ps1
```
脚本会自动启动所有依赖服务并启动前端开发服务器。支持参数：`-SkipDocker`、`-SkipFrontend`、`-Help`。

### 2. 数据库操作
```bash
# 进入数据库容器
docker-compose exec db psql -U openrise -d openrise

# Prisma Studio（可视化数据）
npm run studio

# 重置开发数据库
npx prisma migrate reset
```

### 3. 文件上传测试
1. 确保MinIO运行: `docker-compose ps minio`
2. 验证存储桶: http://localhost:9001
3. 上传测试文件
4. 验证访问: http://localhost:3000/uploads/filename

## 代码规范

### 1. 命名约定
- **组件**: PascalCase (`UserProfile.tsx`)
- **函数/变量**: camelCase (`getUserData`)
- **常量**: UPPER_SNAKE_CASE (`API_ENDPOINT`)
- **文件**: kebab-case 用于非组件 (`auth-service.ts`)

### 2. 导入顺序
```typescript
// 1. 外部依赖
import React from 'react';
import Image from 'next/image';

// 2. 内部模块
import { auth } from '@/lib/auth';
import UserProfile from '@/components/UserProfile';

// 3. 类型定义
import type { User } from '@prisma/client';
```

### 3. 错误处理
```typescript
// 异步操作使用 try/catch
try {
  const data = await fetchData();
} catch (error) {
  console.error('操作失败:', error);
  // 用户友好的错误提示
}

// API路由返回标准响应
return NextResponse.json(
  { error: '错误消息' },
  { status: 400 }
);
```

### 4. 类型安全
- 使用 TypeScript 严格模式
- 避免 `any` 类型
- 为API响应定义明确类型
- 使用 Prisma 生成的类型

## 调试技巧

### 1. 前端调试
- 浏览器开发者工具
- React DevTools 扩展
- 控制台日志（适度使用）

### 2. 后端调试
- API路由日志
- 数据库查询日志（Prisma）
- Docker容器日志: `docker-compose logs -f`

### 3. 网络调试
- 浏览器网络面板
- 检查API响应状态
- 验证CORS头部

### 4. 环境问题
- 检查环境变量是否正确加载
- 验证服务连接（数据库、MinIO）
- 检查端口冲突

## 性能优化

### 1. 图片优化
- 使用 Next.js Image 组件
- 优化图片尺寸和格式
- 懒加载非关键图片

### 2. 数据获取
- 服务端组件减少客户端JavaScript
- 适当使用缓存（React缓存、HTTP缓存）
- 分页加载大量数据

### 3. 代码分割
- 动态导入大型组件
- 按路由分割代码
- 避免捆绑包过大

## 安全考虑

### 1. 输入验证
- 所有用户输入进行验证
- 使用Zod或其他验证库
- SQL注入防护（Prisma自动处理）

### 2. 文件上传
- 验证文件类型和大小
- 扫描恶意文件
- 存储在对象存储而非文件系统

### 3. 认证授权
- 保护敏感API端点
- 验证用户权限
- 使用HTTPS生产环境

### 4. 环境安全
- 不提交敏感信息到版本控制
- 使用不同环境的密钥
- 定期轮换密钥

## 扩展建议

### 1. 监控与日志
- 添加应用性能监控（APM）
- 结构化日志记录
- 错误追踪（Sentry）

### 2. 测试策略
- 单元测试关键函数
- 集成测试API端点
- E2E测试用户流程

### 3. 部署优化
- Docker镜像优化（多阶段构建）
- CI/CD流水线自动化
- 蓝绿部署或金丝雀发布

---

**文档版本**: 1.0  
**最后更新**: 2026-04-09  
**维护者**: Claude Code Assistant  
**相关文档**: 
- `docs/project-architecture.md` - 项目架构
- `docs/ui-feature-flags.md` - 功能开关管理
- `DEV_GUIDE.md` - 开发环境设置
# OpenRise 项目文档

欢迎来到 OpenRise 项目文档中心。本文档集为开发者、维护者和 AI Agent 提供全面的项目信息和指南。

## 文档索引

### 核心架构
| 文档 | 描述 | 主要读者 |
|------|------|----------|
| [📋 项目架构](project-architecture.md) | 系统整体架构、技术栈、服务设计 | 架构师、新开发者 |
| [🧭 代码库指南](codebase-guide.md) | 代码组织、常见修改模式、开发工作流 | 开发者、AI Agent |

### 功能管理
| 文档 | 描述 | 主要读者 |
|------|------|----------|
| [🎛️ UI功能开关](ui-feature-flags.md) | 条件渲染、功能开关、隐藏元素管理 | 产品经理、前端开发者 |

### 运维部署
| 文档 | 描述 | 主要读者 |
|------|------|----------|
| [🚀 开发指南](../DEVELOPMENT.md) | 本地开发环境设置、部署流程 | 所有开发者 |
| [📖 项目说明](../README.md) | 项目概述、快速开始、功能列表 | 所有用户 |

## 文档更新日志

### 2026-04-09
- **文档体系创建**: 建立结构化文档框架
- **架构文档**: 详细记录项目架构和技术栈
- **代码库指南**: 提供代码理解和修改指南
- **功能开关文档**: 记录UI隐藏元素和条件渲染逻辑

### 相关修改
- **首页隐藏修改**: 隐藏定价链接和会员CTA模块
  - 位置: `frontend/app/page.tsx`
  - 开关变量: `showPricing`, `showMembershipCTA`
  - 详细记录: 见 [UI功能开关](ui-feature-flags.md)

## 如何使用这些文档

### 对于新开发者
1. 从 [项目架构](project-architecture.md) 开始了解整体设计
2. 阅读 [代码库指南](codebase-guide.md) 理解代码组织
3. 查看 [开发指南](../DEVELOPMENT.md) 设置本地环境

### 对于 AI Agent
1. 使用 [代码库指南](codebase-guide.md) 了解代码模式
2. 参考 [项目架构](project-architecture.md) 理解系统边界
3. 检查 [UI功能开关](ui-feature-flags.md) 了解功能状态

### 对于产品经理
1. 查看 [UI功能开关](ui-feature-flags.md) 了解功能可用性
2. 阅读 [项目说明](../README.md) 了解产品功能

## 文档维护指南

### 更新频率
- **架构文档**: 重大架构变更时更新
- **代码指南**: 代码模式变化时更新
- **功能开关**: 功能状态变化时立即更新

### 添加新文档
1. 在 `docs/` 目录创建 `.md` 文件
2. 使用清晰的文件名（英文小写，连字符分隔）
3. 更新本索引文件 (`README.md`)
4. 确保与其他文档链接一致

### 文档标准
- 使用 Markdown 格式
- 包含版本信息和维护者
- 保持链接有效
- 使用中文为主，技术术语保留英文

## 快速链接

### 关键文件位置
- **首页**: `frontend/app/page.tsx`
- **认证配置**: `frontend/lib/auth.ts`
- **数据库模型**: `frontend/prisma/schema.prisma`
- **环境配置**: `.env.development`, `frontend/.env.local`

### 重要配置
- **数据库**: `DATABASE_URL` (PostgreSQL连接)
- **认证**: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **文件存储**: `MINIO_ENDPOINT`, `MINIO_BUCKET`

## 获取帮助

1. **代码问题**: 查看相关文档和代码注释
2. **环境问题**: 参考 [开发指南](../DEVELOPMENT.md)
3. **架构问题**: 阅读 [项目架构](project-architecture.md)
4. **功能状态**: 检查 [UI功能开关](ui-feature-flags.md)

---

**文档版本**: 1.0  
**最后更新**: 2026-04-09  
**维护者**: Claude Code Assistant  
**项目状态**: 开发中  
**文档状态**: 持续维护
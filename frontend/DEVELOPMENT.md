# Zero One 前端开发文档

> 本文档用于记录项目结构、开发进度、维护指南，便于后续协作与交接。

---

## 一、项目概览

| 项目 | 说明 |
|------|------|
| **产品名称** | Zero One |
| **定位** | 用 AI 帮助普通人成长，零门槛学习，场景实战 |
| **技术栈** | Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 |
| **语言** | 全站中文 |
| **状态** | 搭建阶段，静态页面已完成 |

---

## 二、目录结构

```
frontend/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx          # 根布局（字体、元数据）
│   ├── page.tsx            # 首页
│   ├── globals.css         # 全局样式、主题变量
│   ├── community/           # 社区页（Coming Soon）
│   │   └── page.tsx
│   ├── courses/            # 内容库
│   │   ├── layout.tsx      # 内容库布局
│   │   ├── page.tsx        # 内容列表（含场景筛选）
│   │   └── [slug]/         # 内容详情（动态路由）
│   │       └── page.tsx
│   ├── pricing/            # 定价页（Coming Soon）
│   │   └── page.tsx
│   └── resources/          # 资源页（Coming Soon）
│       └── page.tsx
├── components/              # 公共组件
│   └── ComingSoon.tsx      # 敬请期待页（社区/定价/资源共用）
├── lib/                     # 数据与工具
│   └── courses.ts          # 内容数据（COURSES、COURSES_CATALOG、ALL_COURSES）
├── public/
│   └── images/             # 图片资源
│       └── logo.jpg        # 网站 Logo（来源：docs/logo1.jpg）
├── scripts/                 # 脚本
│   ├── dev.mjs             # 开发服务器（支持局域网访问）
│   └── download-images.mjs # 图片下载
├── package.json
└── DEVELOPMENT.md          # 本文档
```

---

## 三、页面与路由

| 路径 | 页面 | 状态 | 说明 |
|------|------|------|------|
| `/` | 首页 | ✅ 完成 | Hero、精选内容、学员评价、共创团队、CTA |
| `/courses` | 内容库列表 | ✅ 完成 | 场景筛选、内容卡片网格 |
| `/courses/[slug]` | 内容详情 | ✅ 完成 | 大纲、讲师、包含内容 |
| `/community` | 社区 | 🚧 Coming Soon | 使用 ComingSoon 组件 |
| `/pricing` | 定价 | 🚧 Coming Soon | 使用 ComingSoon 组件 |
| `/resources` | 资源 | 🚧 Coming Soon | 使用 ComingSoon 组件 |

---

## 四、核心数据

### 内容数据 (`lib/courses.ts`)

- **COURSES**：首页展示的 3 个核心内容（求职、论文、家庭教育）
- **COURSES_CATALOG**：内容库列表的 6 个补充内容
- **ALL_COURSES**：全部内容，用于列表页筛选
- **场景分类**：求职就业、论文调研、家庭教育、工作效率

### 修改内容时

1. 编辑 `lib/courses.ts`
2. 新增内容：在 `COURSES` 或 `COURSES_CATALOG` 中按 `Course` 接口添加
3. 新增场景：在 `courses/page.tsx` 的 `TOPICS` 中增加，并在 `courses.ts` 中为内容设置对应 `topic`

---

## 五、设计规范

### 主题色

| 变量 | 色号 | 用途 |
|------|------|------|
| `--primary` | `#064e3b` | 主色（按钮、链接、强调） |
| `--accent-sage` | `#dcfce7` | 辅助色（背景、边框） |
| `--cream` | `#FAFAFA` | 页面背景 |

### Logo 与 Favicon

- **Logo**：`public/images/logo.jpg`，用于页眉、页脚、各页面品牌区（来源：docs/logo1.jpg）
- **Favicon**：`app/icon.jpg`（与 Logo 同源），浏览器标签页图标

### 字体

- **全站**：Inter（无衬线）
- `font-sans` / `font-display` 均使用 Inter

### Tailwind 类名

- 主色：`text-primary`、`bg-primary`、`border-primary`
- 背景：`bg-cream`、`bg-green-50/30`

---

## 六、开发命令

```bash
# 开发（支持局域网访问）
npm run dev

# 构建
npm run build

# 生产运行
npm start

# 下载图片（如有脚本）
npm run download-images
```

---

## 七、待开发功能（参考产品文档）

根据 `docs/AI 人才识别与培养平台 - 产品设计文档.pdf`：

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 内容库详情完善 | 高 | 前置条件、实现步骤、培训录屏 |
| 培训系统 | 高 | 培训预告、报名、录屏回放 |
| 用户系统 | 中 | 注册/登录、个人主页 |
| 学员提交内容 | 中 | 需审核 |
| 评论与互动 | 低 | 第二版 |
| 付费课程 | 低 | 商业化 |

---

## 八、相关文档

- `docs/Zero One-产品核心理念.md`：产品理念与定位
- `docs/AI 人才识别与培养平台 - 产品设计文档.pdf`：完整产品设计

---

## 九、更新记录

| 日期 | 更新内容 |
|------|----------|
| 2024-03 | 初版：品牌 Zero One、全站中文、全栈 Inter 字体、静态页面完成 |

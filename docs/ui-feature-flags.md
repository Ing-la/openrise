# UI 功能开关与隐藏元素管理

## 概述

本文档记录 OpenRise 项目中所有 UI 功能开关、条件渲染逻辑和暂时隐藏的元素。这些开关用于控制功能的显示/隐藏，而非永久删除代码，便于未来快速启用。

**核心原则**：
- 使用条件渲染而非删除代码
- 集中管理开关变量
- 清晰注释开关用途
- 便于未来恢复功能

## 首页功能开关

### 控制变量位置
`frontend/app/page.tsx` 第 124-125 行：

```typescript
// 控制显示开关
const showPricing = false;      // 控制顶部导航栏"定价"链接显示
const showMembershipCTA = false; // 控制底部"成为会员"CTA模块显示
```

### 1. 顶部导航栏"定价"链接

**文件**: `frontend/app/page.tsx`  
**位置**: 第 149-157 行（原 149-154 行）  
**修改时间**: 2026-04-09  
**修改原因**: 暂时隐藏定价页面入口，定价功能尚未完全就绪

**原始代码**:
```tsx
<Link
  href="/pricing"
  className="text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-primary"
>
  定价
</Link>
```

**修改后代码**:
```tsx
{showPricing && (
  <Link
    href="/pricing"
    className="text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-primary"
  >
    定价
  </Link>
)}
```

**影响**:
- 导航栏中不显示"定价"链接
- 用户无法通过导航访问定价页面
- 定价页面本身仍存在（`/app/pricing/page.tsx`）

**恢复方法**:
```typescript
const showPricing = true; // 改为 true 即可恢复显示
```

### 2. 底部"成为会员"CTA模块

**文件**: `frontend/app/page.tsx`  
**位置**: 第 355-412 行（原 348-405 行）  
**修改时间**: 2026-04-09  
**修改原因**: 暂时隐藏会员招募模块，等待合适的推出时机

**原始代码**:
```tsx
{/* CTA */}
<section className="bg-cream px-6 py-32">
  <!-- 整个CTA模块内容 -->
</section>
```

**修改后代码**:
```tsx
{/* CTA */}
{showMembershipCTA && (
  <section className="bg-cream px-6 py-32">
    <!-- 整个CTA模块内容 -->
  </section>
)}
```

**模块内容**:
- 标题："成为创始成员"
- 描述：从第一天起与我们一起成长...
- 功能列表：场景化AI实战培训、社群交流、创始成员标识、新案例抢先体验
- 价格：¥199/月
- 行动按钮："立即加入"

**恢复方法**:
```typescript
const showMembershipCTA = true; // 改为 true 即可恢复显示
```

## 其他潜在功能开关

### 社区页面状态
**文件**: `frontend/app/community/page.tsx`  
**当前状态**: 页面存在但内容简单，显示"敬请期待"  
**计划**: 社区功能待开发，可能需要类似开关控制

### 定价页面状态
**文件**: `frontend/app/pricing/page.tsx`  
**当前状态**: 页面存在但可能未完全实现  
**建议**: 如定价页面未就绪，可添加开关隐藏整个页面路由

## 开关管理最佳实践

### 1. 变量命名规范
- 使用 `show` 前缀：`showFeatureName`
- 使用 `enable` 前缀：`enableFeatureName`
- 使用 `is` 前缀：`isFeatureEnabled`

### 2. 位置选择
- **组件级**: 在组件内部定义（适合简单开关）
- **配置级**: 在环境变量或配置文件中定义（适合环境相关开关）
- **特性标志服务**: 未来可集成特性标志服务（如LaunchDarkly）

### 3. 类型安全
```typescript
// 推荐使用类型注解
const showPricing: boolean = false;
const enableExperimentalFeature: boolean = process.env.NEXT_PUBLIC_EXPERIMENTAL === 'true';
```

### 4. 环境相关开关
```typescript
// 基于环境的开关
const isPricingEnabled = process.env.NEXT_PUBLIC_ENABLE_PRICING === 'true';
const isMembershipEnabled = process.env.NODE_ENV === 'production';
```

## 部署与切换流程

### 开发环境切换
1. 修改 `frontend/app/page.tsx` 中的开关变量
2. 保存文件，Next.js自动热重载
3. 验证UI变化

### 生产环境切换
1. **方法一**: 修改代码并重新部署
   ```bash
   # 修改开关变量为 true
   git commit -m "启用定价和会员CTA功能"
   git push
   ssh server "cd /path/to/project && git pull && docker-compose up -d --build frontend"
   ```

2. **方法二**: 通过环境变量控制（推荐未来实现）
   ```typescript
   // 在代码中使用环境变量
   const showPricing = process.env.NEXT_PUBLIC_SHOW_PRICING === 'true';
   const showMembershipCTA = process.env.NEXT_PUBLIC_SHOW_MEMBERSHIP_CTA === 'true';
   ```

3. **方法三**: 动态特性标志
   - 集成特性标志服务
   - 支持无需部署的动态切换
   - 支持A/B测试

## 历史记录

### 2026-04-09: 初始隐藏修改
- **修改者**: Claude Code Assistant
- **修改内容**: 
  1. 隐藏顶部导航栏"定价"链接
  2. 隐藏底部"成为会员"CTA模块
- **原因**: 用户要求暂时隐藏这些元素，但保留代码
- **技术实现**: 条件渲染 (`{showX && ...}`)
- **开关变量**: `showPricing`, `showMembershipCTA`

### 未来计划
1. **集中管理**: 创建 `lib/feature-flags.ts` 集中管理所有开关
2. **环境变量集成**: 将开关移到环境变量中
3. **管理界面**: 为管理员提供开关控制界面
4. **A/B测试**: 支持基于用户的特性展示

## 故障排除

### 开关不生效
1. **检查变量值**: 确保开关变量为 `true`/`false`
2. **检查渲染逻辑**: 确保条件渲染语法正确 (`{show && <Component />}`)
3. **检查作用域**: 确保变量在组件作用域内可访问
4. **清除缓存**: Next.js开发服务器可能需要重启

### 布局问题
- 隐藏元素后可能出现布局空隙
- 使用CSS `display: none` 或条件渲染解决
- 当前实现使用条件渲染，不会产生DOM元素

### 类型错误
- TypeScript可能提示条件渲染的类型问题
- 确保条件表达式返回布尔值
- 使用双重否定确保布尔转换：`!!showFeature`

---

**文档版本**: 1.0  
**最后更新**: 2026-04-09  
**维护者**: Claude Code Assistant  
**相关文件**: `frontend/app/page.tsx`
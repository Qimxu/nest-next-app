# 架构说明

本文档说明 `nest-next-app` 的核心设计决策，帮助使用者理解和二次开发。

---

## 一、单进程架构

### 设计选择

```
┌─────────────────────────────────────────────┐
│  Node.js 进程（端口 3000）                    │
│                                             │
│  NestJS                                     │
│  ├── /auth/*          → AuthController      │
│  ├── /users/*         → UsersController     │
│  ├── /health          → HealthController    │
│  ├── /docs            → Swagger UI          │
│  └── /* (catch-all)   → NextController      │
│                              ↓              │
│                         Next.js Handler     │
│                         (App Router SSR)    │
└─────────────────────────────────────────────┘
```

**为什么选择单进程，而不是 NestJS + Next.js 分开部署？**

| 方案             | 优点                                   | 缺点                                      |
| ---------------- | -------------------------------------- | ----------------------------------------- |
| 单进程（本模板） | 部署简单、内部调用零延迟、无需跨域配置 | 无法独立扩展前后端                        |
| 分开部署         | 可独立扩展、职责清晰                   | 需要反向代理、跨域配置、内部 API 网络调用 |

**适用场景**：小型项目、MVP、全栈独立开发者、需要快速部署的场景。
**不适用场景**：需要前后端独立横向扩展的高流量应用。

### Next.js 集成方式

`src/modules/next/next.controller.ts` 使用 `@All('*') @Public()` 捕获所有未被其他路由匹配的请求，转发给 Next.js handler：

```typescript
@All('*')
@Public()
async handler(@Req() req: Request, @Res() res: Response) {
  await this.nextService.handler(req, res);
}
```

**顺序很重要**：NestJS 路由注册在 Next.js catch-all 之前，API 路由优先匹配。

---

## 二、SSR 认证链路

### 完整流程

```
浏览器刷新页面
  ↓
NestJS 收到请求（Cookie: access_token=xxx）
  ↓
JwtAuthGuard → NextController 有 @Public()，直接放行
  ↓
Next.js App Router 接管
  ↓
app/[locale]/layout.tsx（async Server Component）
  ↓
Promise.all([
  getMessages(locale),           // i18n 翻译
  getServerFullUser()            // 完整用户信息
])
  ↓
getServerFullUser()
  ├── getServerUser()
  │     └── decodeJwt(cookie)   ← 不验签，只检查 exp 过期时间
  └── fetch('http://localhost:3000/users/profile', Bearer token)
        └── NestJS 验签 + 返回完整 User（含真实 name/role）
  ↓
<AuthProvider initialUser={realUser}>
  ↓
首屏直接渲染正确的用户信息，无闪烁
  ↓
客户端 useEffect：读 document.cookie → tokenManager.setToken()
  ↓
后续 API 调用携带 Authorization: Bearer xxx
```

### 为什么用 `decodeJwt` 不用 `jwtVerify`

SSR 层（Next.js Server Component）不持有 JWT secret，验签需要 secret 与 NestJS 保持一致。
如果 Next.js 用不同默认值或配置不当 → 验证失败 → 首屏返回未登录状态。

**权衡**：SSR 阶段只做 UI 初始化，真正的权限验证由每次 API 调用时 NestJS 守卫完成。
`decodeJwt` 仍然检查 `exp` 过期时间，不接受过期 Token。

---

## 三、JWT 双 Token 策略

```
┌──────────────┐           ┌─────────────────┐
│ access_token │           │  refresh_token  │
│  (30分钟)    │           │    (7天)        │
│ httpOnly=false│          │ httpOnly=true   │
│ JS 可读      │           │ 仅服务端可读    │
└──────────────┘           └─────────────────┘
       ↓                          ↓
  客户端恢复                  自动刷新
  tokenManager              （Cookie 携带）
```

| Cookie          | httpOnly | 用途                              |
| --------------- | -------- | --------------------------------- |
| `access_token`  | `false`  | 浏览器 JS 读取，恢复 tokenManager |
| `refresh_token` | `true`   | 仅服务端，防 XSS 盗取             |

### Refresh Token 轮换

每次调用 `POST /auth/refresh` 时：

1. 验证旧 refresh token（Redis 存储的值必须匹配）
2. 旧 refresh token 自动失效（Redis 中被新 token 覆盖）
3. 返回新 access token + 新 refresh token

这防止了 refresh token 泄露后的长期滥用。

---

## 四、Guard 与 Interceptor 执行顺序

```
HTTP 请求
  ↓
[Middleware] SecurityMiddleware（安全头）
  ↓
[Guard] JwtAuthGuard（验证 Bearer token）
  ↓
[Guard] RolesGuard（验证角色权限）
  ↓
[Interceptor] ThrottleInterceptor（速率限制）
  ↓
[Interceptor] TokenBlacklistInterceptor（检查 token 黑名单）
  ↓
[Interceptor] TransformInterceptor（统一响应格式）
  ↓
[Pipe] ValidationPipe / SanitizePipe
  ↓
Controller Handler
  ↓
[Interceptor] TransformInterceptor（包装响应）
  ↓
HTTP 响应 { code, message, data, timestamp, path }
```

### 装饰器规则

| 装饰器                        | 作用                        |
| ----------------------------- | --------------------------- |
| `@Public()`                   | 跳过 JwtAuthGuard，无需登录 |
| `@Roles(UserRole.ADMIN)`      | 需要特定角色（需登录）      |
| `@Throttle({ ttlMs, limit })` | 启用速率限制                |
| 默认（无装饰器）              | 需要登录（JWT 守卫拦截）    |

**注意**：`@Public()` 和 `@Roles()` 不能同时使用。`@Public()` 完全绕过认证，`RolesGuard` 需要在认证通过后才能读取 `req.user`。

---

## 五、统一响应格式

所有 NestJS API 经过 `TransformInterceptor` 包装：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": "2026-03-20T12:00:00.000Z",
  "path": "/users/profile"
}
```

错误响应（经 `HttpExceptionFilter`）：

```json
{
  "code": 401,
  "message": "Unauthorized",
  "data": null,
  "timestamp": "2026-03-20T12:00:00.000Z",
  "path": "/users/profile"
}
```

前端 `HttpClient.handleResponse()` 自动解包，直接返回 `data` 字段。

---

## 六、数据库迁移策略

**开发环境**：`DB_SYNCHRONIZE=true`，TypeORM 自动同步 Entity 结构（无需手动迁移）。
**生产环境**：`DB_SYNCHRONIZE=false`，必须使用迁移文件，防止意外结构变更。

```bash
# 生成迁移（根据 Entity 变化自动生成 SQL）
npm run migration:generate -- src/migrations/AddUserAvatarColumn

# 执行迁移
npm run migration:run

# 回滚最后一次迁移
npm run migration:revert
```

---

## 七、安全设计

### 已实现

| 防护       | 实现方式                                            |
| ---------- | --------------------------------------------------- |
| XSS        | `SanitizePipe`（输入清洗）+ CSP 安全头              |
| CSRF       | `SameSite=lax` Cookie + 非 httpOnly access token    |
| 暴力破解   | `@Throttle()` 限流（登录 10次/分钟，注册 5次/分钟） |
| Token 泄露 | Refresh Token 轮换 + 登出时加黑名单                 |
| 信息泄露   | 忘记密码接口不暴露邮箱是否存在                      |
| 权限越权   | `RolesGuard` + 移除危险接口的 `@Public()`           |
| 点击劫持   | `X-Frame-Options: DENY`                             |
| MIME 嗅探  | `X-Content-Type-Options: nosniff`                   |
| 中间人攻击 | `HSTS` 头（生产环境）                               |

### 已知待完善

- [ ] 邮件服务（`auth.controller.ts` 中 TODO 注释）：集成 Nodemailer 发送真实密码重置邮件
- [ ] 登录失败锁定：连续失败 N 次后临时封禁 IP
- [ ] 双因素认证（2FA）：TOTP

---

## 八、国际化

- 路由格式：`/zh/*`、`/en/*`
- 翻译文件：`messages/zh.json`、`messages/en.json`
- 配置：`i18n.config.ts`（locales、defaultLocale、localeNames 等常量统一在此定义）
- 用法：`const t = useTranslations()`（直接使用 next-intl 提供的 hook），`t('auth.login')`
- 切换语言：`lib/i18n/LanguageSwitcher.tsx` 替换路径中的 locale 段

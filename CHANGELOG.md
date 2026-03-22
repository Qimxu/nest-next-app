# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.1] - 2026-03-22

### Added

- 完整的 NestJS + Next.js 一体化全栈模板（同一进程 SSR）
- JWT 双 Token 认证体系（Access 30min + Refresh 7d），Redis 黑名单机制
- 用户模块：CRUD、分页、RBAC 角色权限（admin / user）
- 忘记密码 / 重置密码（基于 Redis 限时 Token）
- 多环境 YAML 配置系统（development / sit / production）+ 本地覆盖
- next-intl 国际化支持（中文 / 英文，路由前缀 `/zh/*` `/en/*`）
- Swagger API 文档（`/docs`）
- Winston 结构化日志
- XSS 防护（SanitizePipe + escapeHtml 工具）
- HTTP 安全头中间件（CSP / HSTS / X-Frame-Options 等）
- 自定义限流拦截器（内存滑动窗口，支持 IP 和用户级别）
- Token 黑名单拦截器
- 三阶段 Dockerfile（deps → build → runner）
- docker-compose（开发依赖）+ docker-compose.prod.yml（生产全量）
- GitHub Actions CI/CD 流水线（Lint → 单测 → E2E → Build → Docker → Deploy）
- Node.js 18 / 20 / 22 多版本矩阵测试
- PR 安全检查（Trivy 漏洞扫描 + npm audit）
- Dependabot 自动依赖更新
- 224 个单元测试，覆盖率全部 ≥ 50%

### Removed

- `src/core/helpers/response.helper.ts` — `ResponseHelper` 工具类无任何调用方，删除死代码
- `src/core/decorators/log.decorator.ts` — `@Log()` 装饰器从未被使用，`LogInterceptor` 已全局注册
- `src/modules/redis/redis.controller.ts` — 调试用的 `GET /redis/test` 端点不应出现在生产代码
- `lib/i18n/useTranslation.ts` — 对 next-intl 的过度封装，零引用
- `lib/hooks/use-auth.ts` — 遗留死代码，路由指向不存在的 `/web/login`
- `lib/store/auth-store.ts` + `lib/store/index.ts` — 仅被死代码引用，`AuthContext` 才是实际认证系统

[Unreleased]: https://github.com/Qimxu/nest-next-app/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/Qimxu/nest-next-app/releases/tag/v1.1.1

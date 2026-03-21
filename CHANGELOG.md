# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [Unreleased]

### Added

- Initial open-source template hardening (CI, linting, Docker, docs)

### Removed

- `src/core/helpers/response.helper.ts` — `ResponseHelper` 工具类无任何调用方，删除死代码
- `src/core/decorators/log.decorator.ts` — `@Log()` 装饰器从未被使用，`LogInterceptor` 已全局注册
- `src/modules/redis/redis.controller.ts` — 调试用的 `GET /redis/test` 端点不应出现在生产代码
- `lib/i18n/useTranslation.ts` — 对 next-intl 的过度封装，零引用
- `lib/hooks/use-auth.ts` — 遗留死代码，路由指向不存在的 `/web/login`
- `lib/store/auth-store.ts` + `lib/store/index.ts` — 仅被死代码引用，`AuthContext` 才是实际认证系统

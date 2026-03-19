# Contributing

Thanks for your interest in contributing!

## Development setup

### Prerequisites

- Node.js >= 18 (CI uses Node.js 20)
- MySQL >= 8
- Redis >= 6

### Install

```bash
npm ci
```

### Start dependencies (recommended)

```bash
docker compose up -d
```

### Configuration

Copy a local config and adjust credentials:

```bash
cp config/app.config.local.yaml.example config/app.config.local.yaml
```

### Run

```bash
npm run start:dev
```

## Quality checks

```bash
npm run format:check
npm run lint:check
npm run typecheck
npm run test
npm run test:e2e
```

## Commit message

This repo enforces Conventional Commits via commitlint.

Examples:

- `feat(auth): add refresh token rotation`
- `fix(users): handle missing profile`

## Pull requests

- Keep PRs focused and small when possible
- Add/adjust tests when changing behavior
- Ensure CI is green

# NestJS + Next.js Integrated Application

A full-stack application that seamlessly integrates NestJS backend with Next.js frontend, running on a single server.

## 🚀 Features

- **NestJS Backend**: Robust backend with powerful dependency injection and modular architecture
- **Next.js Frontend**: Modern React framework with App Router and server-side rendering
- **Unified Routing**: Single server handling both API routes (`/api/*`) and Next.js pages
- **JWT Authentication**: Secure authentication with access tokens and refresh tokens
- **Redis Cache**: Token blacklist and caching support
- **TypeORM**: MySQL database with migrations support
- **Swagger API Documentation**: Interactive API documentation
- **TypeScript**: Full type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Winston Logger**: Production-ready logging system

## 📁 Project Structure

```
nest-next-app/
├── src/                          # NestJS backend source
│   ├── main.ts                   # Application entry point
│   ├── app.module.ts             # Root module
│   ├── common/                   # Shared utilities
│   │   ├── config/               # Configuration files
│   │   ├── decorators/           # Custom decorators
│   │   ├── filters/              # Exception filters
│   │   ├── interceptors/         # Request interceptors
│   │   ├── interfaces/           # TypeScript interfaces
│   │   └── logger/               # Winston logger
│   └── modules/                  # Feature modules
│       ├── auth/                 # Authentication module
│       ├── users/                # User management
│       ├── redis/                # Redis service
│       ├── health/               # Health check
│       └── next/                 # Next.js integration
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── login/                    # Login page
│   ├── register/                 # Register page
│   ├── users/                    # Users page
│   └── globals.css               # Global styles
├── lib/                          # Frontend utilities
│   ├── api/                      # API client and services
│   ├── hooks/                    # React hooks
│   └── store/                    # Zustand state management
├── config/                       # Environment configuration files
├── test/                         # E2E tests
├── package.json
└── README.md
```

## 🛠️ Installation

### Prerequisites
- Node.js 20+
- MySQL 8.0+
- Redis 6.0+

### Setup

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

4. Create MySQL database:
```sql
CREATE DATABASE nest_next_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. Run database migrations:
```bash
npm run migration:run
```

6. Start the application:
```bash
npm run start:dev
```

7. Visit `http://localhost:3000`

## 📡 Available Routes

### Web Pages
- `/web` - Home page
- `/web/login` - Login page
- `/web/register` - Register page
- `/web/users` - Users list

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (requires authentication)

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/profile` - Get current user (requires authentication)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `DELETE /api/users/:id` - Delete user (requires authentication)

#### Redis
- `GET /api/redis/test` - Test Redis connection
- `POST /api/redis/set` - Set cache value
- `GET /api/redis/get/:key` - Get cache value

#### Health
- `GET /health` - Health check

#### API Documentation
- `GET /api/docs` - Swagger API documentation

## 🗃️ Database Migrations

### Create a new migration
```bash
npm run migration:create -- src/migrations/MigrationName
```

### Generate migration from entity changes
```bash
npm run migration:generate -- src/migrations/MigrationName
```

### Run migrations
```bash
npm run migration:run
```

### Revert last migration
```bash
npm run migration:revert
```

### View migration status
```bash
npm run migration:show
```

## 🐳 Docker Deployment

### Build and run with Docker Compose

```bash
# Development
npm run docker:dev

# Production
npm run docker:prod
```

### Manual Docker build
```bash
docker build -t nest-next-app .
docker run -p 3000:3000 nest-next-app
```

## 📝 Scripts

### Development
- `npm run start:dev` - Start with watch mode (development)
- `npm run start:sit` - Start in SIT environment
- `npm run start:debug` - Start with debug mode

### Production
- `npm run build` - Build the application
- `npm run start:prod` - Start in production mode
- `npm run deploy:dev` - Build and deploy to development
- `npm run deploy:sit` - Build and deploy to SIT
- `npm run deploy:prd` - Build and deploy to production

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests

### Code Quality
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3306` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | ` ` |
| `DB_DATABASE` | Database name | `nest_next_app` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT secret key | *required* |
| `JWT_REFRESH_SECRET` | JWT refresh secret | *required* |

### Configuration Files

Configuration files are located in the `config/` directory:
- `app.config.development.yaml` - Development config
- `app.config.sit.yaml` - SIT config
- `app.config.production.yaml` - Production config

## 🎨 Tech Stack

### Backend
- **NestJS**: Progressive Node.js framework
- **TypeORM**: SQL ORM
- **Passport.js**: Authentication middleware
- **JWT**: JSON Web Tokens
- **Redis**: Caching and token blacklist
- **Winston**: Logging
- **Swagger**: API documentation

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **Tailwind CSS**: Styling
- **Zustand**: State management

## 📄 License

MIT

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test && npm run test:e2e`
4. Submit a pull request

## 📋 CI/CD

The project includes GitHub Actions workflows for:
- Lint and test on pull requests
- Build and deploy on merge to main/develop
- Docker image building and publishing

<h1 align="center">FicReview API</h1>

FicReview is a NestJS-based backend for a fanfiction platform: user auth, fanfics with chapters and comments, likes, WebSockets, and Redis caching for fast reads.

**Deploy:** https://ficreview.aliph0th.ru

**Postman Collection:** [FicReview API](https://documenter.getpostman.com/view/20130039/2sB3QGurwf) (you can replace collection variable `base` with deploy url)

## Features

- Authentication (local + JWT), email verification, role-based access
- Fanfics: CRUD, cover uploads (S3-compatible storage), likes, popularity sorting
- Chapters: CRUD, content stored in object storage
- Comments: CRUD, WebSocket notifications
- Caching: Redis cache-aside with versioned keys and TTLs
- Pagination DTOs, validation pipes, and transformation via class-transformer
- PostgreSQL via Sequelize (sequelize-typescript), migrations via Umzug
- Docker: Postgres, Redis, dockerized app and migrator service

## Tech Stack

- Node, NestJS, TypeScript
- PostgreSQL, Sequelize + sequelize-typescript
- Redis (ioredis)
- Sharp for image processig
- Socket.IO for real-time events
- Winston for logging, Helmet for security headers

## Getting Started

1) Clone and install dependencies

```bash
pnpm install
```

2) Configure environment

Create a `.env` in project root (look at `.env.example`)

3) Run with Docker (recommended)

```bash
docker compose up --build
```

This brings up Postgres, Redis, runs migrations, and starts the API at http://localhost:3333.

## Caching Strategy

Cache-aside with versioned keys:

- Each entity/list has a version key in Redis, e.g. `ver:fanfic:ID`, `ver:fanfics`.
- Cached payload keys include the version (e.g. `fanfic:<ID>:v<VER>`).
- On writes (create/update/delete/like), the relevant version keys are incremented, which invalidates old cached entries without explicit deletes.
- **Currently, cache invalidation isn't working properly with associations**

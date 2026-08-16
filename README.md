# GS1 Full Stack Backend

NestJS backend with Prisma ORM and Supabase (PostgreSQL, Auth, Storage).

## Stack

- **NestJS** — API framework
- **Prisma** — database ORM
- **PostgreSQL** — via Supabase
- **Supabase Auth** — JWT validation on protected routes

## Data Model

```
User (Supabase Auth)
 └── DataRoom
      └── Folder
           ├── Folder
           └── File

Share
```

| Model | Fields |
|-------|--------|
| **DataRoom** | id, name, ownerId, createdAt |
| **Folder** | id, name, dataRoomId, parentId?, createdAt, updatedAt |
| **File** | id, name, storageKey, mimeType, size, folderId, createdAt, updatedAt |
| **Share** | id, resourceType, resourceId, permission, type, userId?, token?, createdBy, createdAt |

User IDs (`ownerId`, `userId`, `createdBy`) reference Supabase Auth users — no local User table.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Fill in `.env` with values from your Supabase dashboard.

4. Run database migrations:

```bash
npm run prisma:migrate
```

5. Start the dev server:

```bash
npm run start:dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start with hot reload |
| `npm run build` | Production build |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run migrations |
| `npm run prisma:studio` | Open Prisma Studio |

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/me` | Current authenticated user |
| GET | `/data-room` | Get or create the user's Data Room |
| GET | `/folders` | Root folders in the user's Data Room |
| GET | `/files?folderId=` | Files in a folder |
| GET | `/shares` | Shares for the current user |

All routes require `Authorization: Bearer <supabase-access-token>` unless marked `@Public()`.

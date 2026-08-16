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
| POST | `/folders` | Create folder (`{ name, parentId? }`) |
| GET | `/folders/:id` | Get folder by id |
| GET | `/folders/:id/contents` | Folder with child folders and files |
| PATCH | `/folders/:id` | Rename folder (`{ name }`) |
| DELETE | `/folders/:id` | Delete folder and all descendants |
| GET | `/files?folderId=` | Files in a folder |
| GET | `/files/:id/download` | Signed download URL for a file |
| PATCH | `/files/:id` | Move file to folder (`{ folderId }`) |
| POST | `/shares` | Create share (`{ resourceType, resourceId, shareType, email? }`) |
| GET | `/shares?resourceType=&resourceId=` | List shares for a resource (owner only) |
| DELETE | `/shares/:id` | Revoke a share (owner only) |
| GET | `/public/shares/:token` | Read-only public access by share token |
| GET | `/public/shares/:token/folders/:folderId/contents` | Public folder contents within share scope |

All routes require `Authorization: Bearer <supabase-access-token>` unless marked `@Public()`.

## Sharing

- **PUBLIC** — anyone with the link gets read-only access via a secure random token.
- **USER** — share with an existing Supabase user by email, read-only.
- Only the resource owner can create or revoke shares.
- Shares inherit down the tree: a Data Room or Folder share grants read access to all nested content without creating per-item Share records.
- Viewers can read shared resources but receive `403` on create, update, delete, move, upload, and share operations.

## Folder delete (MVP)

Deleting a folder uses PostgreSQL cascade for nested folders and file records:

```
DataRoom → Folder → Folder → File
```

Before the DB delete, the API attempts to remove related objects from Supabase Storage using each file's `storageKey`. Storage cleanup is **best-effort**: if storage deletion fails, the error is logged and the DB delete still proceeds. Orphaned storage objects may remain and can be cleaned up manually or by a future background job.

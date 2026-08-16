import { PrismaClient } from '@prisma/client';
import type {
  DatabaseClient,
  DatabaseConnection,
  DatabaseLifecycle,
} from './database.client';

/**
 * Single Prisma boundary: maps generated PrismaClient to our typed DatabaseClient.
 * ESLint cannot resolve @prisma/client delegate types in projectService; keep calls here.
 */

export function createDatabaseClient(): DatabaseConnection {
  const prisma = new PrismaClient();
  const client: DatabaseClient = {
    dataRoom: {
      upsert: (args) => prisma.dataRoom.upsert(args),
      findById: (args) => prisma.dataRoom.findUnique(args),
      findOwnerId: (args) => prisma.dataRoom.findUnique(args),
    },
    folder: {
      findMany: (args) => prisma.folder.findMany(args),
      findById: (args) => prisma.folder.findUnique(args),
      findByIdWithOwner: (args) => prisma.folder.findUnique(args),
      create: (args) => prisma.folder.create(args),
      update: (args) => prisma.folder.update(args),
      delete: (args) => prisma.folder.delete(args),
    },
    file: {
      findMany: (args) => prisma.file.findMany(args),
      findById: (args) => prisma.file.findUnique(args),
      updateFolder: (args) => prisma.file.update(args),
    },
    share: {
      findMany: (args) => prisma.share.findMany(args),
      findPublicShare: (args) => prisma.share.findFirst(args),
      findUserShare: (args) => prisma.share.findFirst(args),
      findUserShareGrant: (args) => prisma.share.findFirst(args),
      findById: (args) => prisma.share.findUnique(args),
      findByToken: (args) => prisma.share.findUnique(args),
      create: (args) => prisma.share.create(args),
      delete: (args) => prisma.share.delete(args),
    },
  };
  const lifecycle: DatabaseLifecycle = {
    connect: () => prisma.$connect(),
    disconnect: () => prisma.$disconnect(),
  };

  return { client, lifecycle };
}

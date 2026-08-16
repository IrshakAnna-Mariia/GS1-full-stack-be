import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { FileEntity } from '../common/entities';
import type { DatabaseClient } from './database.client';

type FileFindManyWhere = { folderId: string } | { folderId: { in: string[] } };

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: DatabaseClient;

  constructor() {
    this.client = new PrismaClient();
  }

  get dataRoom(): DatabaseClient['dataRoom'] {
    return this.client.dataRoom;
  }

  get folder(): DatabaseClient['folder'] {
    return this.client.folder;
  }

  get share(): DatabaseClient['share'] {
    return this.client.share;
  }

  findFiles(args: {
    where: FileFindManyWhere;
    orderBy?: { name: 'asc' };
  }): Promise<FileEntity[]> {
    return this.client.file.findMany(args);
  }

  findFileById(id: string): Promise<FileEntity | null> {
    return this.client.file.findUnique({ where: { id } });
  }

  updateFileFolder(id: string, folderId: string): Promise<FileEntity> {
    return this.client.file.update({
      where: { id },
      data: { folderId },
    });
  }

  async onModuleInit(): Promise<void> {
    await (this.client as unknown as PrismaClient).$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await (this.client as unknown as PrismaClient).$disconnect();
  }
}

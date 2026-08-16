import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { FileEntity } from '../common/entities';
import { DatabaseGateway } from '../prisma/database.gateway';

@Injectable()
export class FilesRepository {
  constructor(private readonly prisma: DatabaseGateway) {}

  findByFolder(folderId: string): Promise<FileEntity[]> {
    return this.prisma.findFiles({
      where: { folderId },
      orderBy: { name: 'asc' },
    });
  }

  findByFolderIds(folderIds: string[]): Promise<FileEntity[]> {
    return this.prisma.findFiles({
      where: { folderId: { in: folderIds } },
    });
  }

  findById(id: string): Promise<FileEntity | null> {
    return this.prisma.findFileById(id);
  }

  create(data: {
    name: string;
    storageKey: string;
    mimeType: string;
    size: number;
    folderId: string;
  }): Promise<FileEntity> {
    return this.prisma.createFile(data);
  }

  updateFolderId(fileId: string, folderId: string): Promise<FileEntity> {
    return this.prisma.updateFileFolder(fileId, folderId);
  }

  updateName(fileId: string, name: string): Promise<FileEntity> {
    return this.prisma.updateFileName(fileId, name);
  }

  delete(fileId: string): Promise<FileEntity> {
    return this.prisma.deleteFile(fileId);
  }

  buildStorageKey(userId: string, folderId: string, fileName: string): string {
    const safeName = fileName.replace(/[^\w.\-() ]+/g, '_');
    return `${userId}/${folderId}/${randomUUID()}/${safeName}`;
  }
}

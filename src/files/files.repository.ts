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

  updateFolderId(fileId: string, folderId: string): Promise<FileEntity> {
    return this.prisma.updateFileFolder(fileId, folderId);
  }
}

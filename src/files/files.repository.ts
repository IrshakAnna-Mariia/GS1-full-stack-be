import { Injectable } from '@nestjs/common';
import type { FileEntity } from '../common/entities';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FilesRepository {
  constructor(private readonly prisma: PrismaService) {}

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

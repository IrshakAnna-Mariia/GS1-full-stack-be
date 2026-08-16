import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { FileEntity, FolderWithDataRoomOwner } from '../common/entities';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResourceAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getFolderForUser(
    userId: string,
    folderId: string,
  ): Promise<FolderWithDataRoomOwner> {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
      include: { dataRoom: { select: { ownerId: true } } },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    if (folder.dataRoom.ownerId !== userId) {
      throw new ForbiddenException('Folder access denied');
    }

    return folder;
  }

  async getFileForUser(userId: string, fileId: string): Promise<FileEntity> {
    const file = await this.prisma.findFileById(fileId);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    await this.getFolderForUser(userId, file.folderId);

    return file;
  }
}

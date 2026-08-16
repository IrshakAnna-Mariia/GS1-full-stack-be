import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { FileEntity, FolderWithDataRoomOwner } from '../common/entities';
import { DatabaseGateway } from '../prisma/database.gateway';
import { ResourceAccessGateway } from './resource-access.gateway';
import { ShareAccessGateway } from './share-access.gateway';

@Injectable()
export class ResourceAccessService extends ResourceAccessGateway {
  constructor(
    private readonly prisma: DatabaseGateway,
    private readonly shareAccess: ShareAccessGateway,
  ) {
    super();
  }

  override async getFolderForRead(
    userId: string,
    folderId: string,
  ): Promise<FolderWithDataRoomOwner> {
    const folder = await this.prisma.findFolderWithOwner(folderId);

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    if (!(await this.shareAccess.canReadFolder(userId, folderId))) {
      throw new ForbiddenException('Folder access denied');
    }

    return folder;
  }

  override async getFolderForWrite(
    userId: string,
    folderId: string,
  ): Promise<FolderWithDataRoomOwner> {
    const folder = await this.getFolderForRead(userId, folderId);
    this.shareAccess.assertCanWrite(userId, folder.dataRoom.ownerId);
    return folder;
  }

  override async getFileForRead(
    userId: string,
    fileId: string,
  ): Promise<FileEntity> {
    const file = await this.prisma.findFileById(fileId);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (!(await this.shareAccess.canReadFile(userId, fileId))) {
      throw new ForbiddenException('File access denied');
    }

    return file;
  }

  override async getFileForWrite(
    userId: string,
    fileId: string,
  ): Promise<FileEntity> {
    const file = await this.getFileForRead(userId, fileId);
    const folder = await this.prisma.findFolderWithOwner(file.folderId);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    this.shareAccess.assertCanWrite(userId, folder.dataRoom.ownerId);
    return file;
  }

  /** @deprecated use getFolderForRead or getFolderForWrite */
  async getFolderForUser(
    userId: string,
    folderId: string,
  ): Promise<FolderWithDataRoomOwner> {
    return this.getFolderForWrite(userId, folderId);
  }

  /** @deprecated use getFileForRead or getFileForWrite */
  async getFileForUser(userId: string, fileId: string): Promise<FileEntity> {
    return this.getFileForWrite(userId, fileId);
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  FolderWithDataRoomOwner,
  ShareEntity,
  ShareResourceType,
} from '../common/entities';
import { DatabaseGateway } from '../prisma/database.gateway';
import { ShareAccessGateway } from './share-access.gateway';

@Injectable()
export class ShareAccessService extends ShareAccessGateway {
  constructor(private readonly prisma: DatabaseGateway) {
    super();
  }

  override async assertResourceOwner(
    userId: string,
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<void> {
    const isOwner = await this.isResourceOwner(
      userId,
      resourceType,
      resourceId,
    );
    if (!isOwner) {
      throw new ForbiddenException(
        'Only the resource owner can perform this action',
      );
    }
  }

  async assertCanReadDataRoom(
    userId: string,
    dataRoomId: string,
  ): Promise<void> {
    if (await this.canReadDataRoom(userId, dataRoomId)) {
      return;
    }
    throw new ForbiddenException('Data room access denied');
  }

  async assertCanReadFolder(userId: string, folderId: string): Promise<void> {
    if (await this.canReadFolder(userId, folderId)) {
      return;
    }
    throw new ForbiddenException('Folder access denied');
  }

  async assertCanReadFile(userId: string, fileId: string): Promise<void> {
    if (await this.canReadFile(userId, fileId)) {
      return;
    }
    throw new ForbiddenException('File access denied');
  }

  override assertCanWrite(userId: string, ownerId: string): void {
    if (userId !== ownerId) {
      throw new ForbiddenException('Write access denied');
    }
  }

  async canReadDataRoom(userId: string, dataRoomId: string): Promise<boolean> {
    const dataRoom = await this.prisma.findDataRoomById(dataRoomId);
    if (!dataRoom) {
      return false;
    }
    if (dataRoom.ownerId === userId) {
      return true;
    }
    return this.hasUserShare(userId, 'DATA_ROOM', dataRoomId);
  }

  override async canReadFolder(
    userId: string,
    folderId: string,
  ): Promise<boolean> {
    const folder = await this.prisma.findFolderWithOwner(folderId);
    if (!folder) {
      return false;
    }
    if (folder.dataRoom.ownerId === userId) {
      return true;
    }
    if (await this.hasUserShare(userId, 'FOLDER', folderId)) {
      return true;
    }
    if (await this.hasUserShare(userId, 'DATA_ROOM', folder.dataRoomId)) {
      return true;
    }
    return this.hasAncestorFolderShare(userId, folder);
  }

  override async canReadFile(userId: string, fileId: string): Promise<boolean> {
    const file = await this.prisma.findFileById(fileId);
    if (!file) {
      return false;
    }
    if (await this.hasUserShare(userId, 'FILE', fileId)) {
      return true;
    }
    return this.canReadFolder(userId, file.folderId);
  }

  async isResourceOwner(
    userId: string,
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<boolean> {
    const ownerId = await this.getResourceOwnerId(resourceType, resourceId);
    return ownerId === userId;
  }

  async getResourceOwnerId(
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<string | null> {
    switch (resourceType) {
      case 'DATA_ROOM':
        return this.prisma.findDataRoomOwnerId(resourceId);
      case 'FOLDER': {
        const folder = await this.prisma.findFolderWithOwner(resourceId);
        return folder?.dataRoom.ownerId ?? null;
      }
      case 'FILE': {
        const file = await this.prisma.findFileById(resourceId);
        if (!file) {
          return null;
        }
        const folder = await this.prisma.findFolderWithOwner(file.folderId);
        return folder?.dataRoom.ownerId ?? null;
      }
      default:
        return null;
    }
  }

  override async isFolderWithinShareScope(
    share: ShareEntity,
    folderId: string,
  ): Promise<boolean> {
    const folder = await this.prisma.findFolderById(folderId);
    if (!folder) {
      return false;
    }

    switch (share.resourceType) {
      case 'DATA_ROOM':
        return folder.dataRoomId === share.resourceId;
      case 'FOLDER':
        if (folder.id === share.resourceId) {
          return true;
        }
        return this.isDescendantOf(folderId, share.resourceId);
      case 'FILE':
        return false;
      default:
        return false;
    }
  }

  override async getValidatedPublicShare(token: string): Promise<ShareEntity> {
    const share = await this.prisma.findShareByToken(token);
    if (!share || share.type !== 'PUBLIC') {
      throw new NotFoundException('Share not found');
    }
    await this.assertResourceExists(share.resourceType, share.resourceId);
    return share;
  }

  async assertResourceExists(
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<void> {
    const ownerId = await this.getResourceOwnerId(resourceType, resourceId);
    if (!ownerId) {
      throw new NotFoundException('Shared resource not found');
    }
  }

  private async hasUserShare(
    userId: string,
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<boolean> {
    const share = await this.prisma.findUserShareGrant(
      resourceType,
      resourceId,
      userId,
    );
    return share !== null;
  }

  private async hasAncestorFolderShare(
    userId: string,
    folder: FolderWithDataRoomOwner,
  ): Promise<boolean> {
    let parentId = folder.parentId;
    while (parentId) {
      if (await this.hasUserShare(userId, 'FOLDER', parentId)) {
        return true;
      }
      const parent = await this.prisma.findFolderById(parentId);
      parentId = parent?.parentId ?? null;
    }
    return false;
  }

  private async isDescendantOf(
    folderId: string,
    ancestorFolderId: string,
  ): Promise<boolean> {
    let current = await this.prisma.findFolderById(folderId);
    while (current?.parentId) {
      if (current.parentId === ancestorFolderId) {
        return true;
      }
      current = await this.prisma.findFolderById(current.parentId);
    }
    return false;
  }
}

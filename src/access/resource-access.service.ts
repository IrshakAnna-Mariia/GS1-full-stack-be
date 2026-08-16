import { Injectable, NotFoundException } from '@nestjs/common';
import type { FileEntity, FolderWithDataRoomOwner } from '../common/entities';
import { DatabaseGateway } from '../prisma/database.gateway';
import { ResourceAccessControlGateway } from './resource-access-control.gateway';
import { ResourceAccessGateway } from './resource-access.gateway';
import type { ResourceAction } from './resource-access.types';

@Injectable()
export class ResourceAccessService extends ResourceAccessGateway {
  constructor(
    private readonly prisma: DatabaseGateway,
    private readonly accessControl: ResourceAccessControlGateway,
  ) {
    super();
  }

  override async assertFolderAccess(
    userId: string,
    folderId: string,
    action: ResourceAction,
  ): Promise<FolderWithDataRoomOwner> {
    const folder = await this.prisma.findFolderWithOwner(folderId);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    await this.accessControl.assertCanPerformAction(
      { id: userId },
      { resourceType: 'FOLDER', resourceId: folderId },
      action,
    );

    return folder;
  }

  override async assertFileAccess(
    userId: string,
    fileId: string,
    action: ResourceAction,
  ): Promise<FileEntity> {
    const file = await this.prisma.findFileById(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    await this.accessControl.assertCanPerformAction(
      { id: userId },
      { resourceType: 'FILE', resourceId: fileId },
      action,
    );

    return file;
  }
}

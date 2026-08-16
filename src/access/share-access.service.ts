import { ForbiddenException, Injectable } from '@nestjs/common';
import type { ShareEntity, ShareResourceType } from '../common/entities';
import { ResourceAccessControlGateway } from './resource-access-control.gateway';
import { ShareAccessGateway } from './share-access.gateway';

@Injectable()
export class ShareAccessService extends ShareAccessGateway {
  constructor(private readonly accessControl: ResourceAccessControlGateway) {
    super();
  }

  override async assertResourceOwner(
    userId: string,
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<void> {
    const access = await this.accessControl.canAccessResource(
      { id: userId },
      { resourceType, resourceId },
    );
    if (access.role !== 'owner') {
      throw new ForbiddenException(
        'Only the resource owner can perform this action',
      );
    }
  }

  override assertCanWrite(userId: string, ownerId: string): void {
    if (userId !== ownerId) {
      throw new ForbiddenException('Write access denied');
    }
  }

  override async canReadFolder(
    userId: string,
    folderId: string,
  ): Promise<boolean> {
    const access = await this.accessControl.canAccessResource(
      { id: userId },
      { resourceType: 'FOLDER', resourceId: folderId },
    );
    return access.allowed;
  }

  override async canReadFile(userId: string, fileId: string): Promise<boolean> {
    const access = await this.accessControl.canAccessResource(
      { id: userId },
      { resourceType: 'FILE', resourceId: fileId },
    );
    return access.allowed;
  }

  override getValidatedPublicShare(token: string): Promise<ShareEntity> {
    return this.accessControl.getValidatedPublicShare(token);
  }

  override isFolderWithinShareScope(
    share: ShareEntity,
    folderId: string,
  ): Promise<boolean> {
    return this.accessControl.isFolderWithinShareScope(share, folderId);
  }
}

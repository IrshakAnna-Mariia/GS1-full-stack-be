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
import { ResourceAccessControlGateway } from './resource-access-control.gateway';
import type {
  AccessUser,
  ResourceAccessOptions,
  ResourceAccessResult,
  ResourceAction,
  ResourceRef,
} from './resource-access.types';
import {
  OWNER_ONLY_ACTIONS,
  VIEWER_ALLOWED_ACTIONS,
} from './resource-access.types';

@Injectable()
export class ResourceAccessControlService extends ResourceAccessControlGateway {
  constructor(private readonly prisma: DatabaseGateway) {
    super();
  }

  override async canAccessResource(
    user: AccessUser | null,
    resource: ResourceRef,
    options?: ResourceAccessOptions,
  ): Promise<ResourceAccessResult> {
    const ownerId = await this.getResourceOwnerId(
      resource.resourceType,
      resource.resourceId,
    );
    if (!ownerId) {
      return { allowed: false, role: 'none' };
    }

    if (user && user.id === ownerId) {
      return { allowed: true, role: 'owner' };
    }

    if (options?.publicShareToken) {
      const publicAccess = await this.hasValidPublicShareToken(
        options.publicShareToken,
        resource,
      );
      if (publicAccess) {
        return { allowed: true, role: 'viewer' };
      }
    }

    if (user && (await this.hasDirectUserShare(user.id, resource))) {
      return { allowed: true, role: 'viewer' };
    }

    if (user && (await this.hasInheritedUserShare(user.id, resource))) {
      return { allowed: true, role: 'viewer' };
    }

    return { allowed: false, role: 'none' };
  }

  override canPerformAction(
    access: ResourceAccessResult,
    action: ResourceAction,
  ): boolean {
    if (!access.allowed) {
      return false;
    }
    if (access.role === 'owner') {
      return true;
    }
    if (access.role === 'viewer') {
      return VIEWER_ALLOWED_ACTIONS.has(action);
    }
    return false;
  }

  override async assertCanPerformAction(
    user: AccessUser | null,
    resource: ResourceRef,
    action: ResourceAction,
    options?: ResourceAccessOptions,
  ): Promise<ResourceAccessResult> {
    const access = await this.canAccessResource(user, resource, options);
    if (!this.canPerformAction(access, action)) {
      if (access.role === 'viewer' && OWNER_ONLY_ACTIONS.has(action)) {
        throw new ForbiddenException('Viewer cannot perform this action');
      }
      throw new ForbiddenException('Access denied');
    }
    return access;
  }

  async getValidatedPublicShare(token: string): Promise<ShareEntity> {
    const share = await this.prisma.findShareByToken(token);
    if (!share || share.type !== 'PUBLIC') {
      throw new NotFoundException('Share not found');
    }
    const ownerId = await this.getResourceOwnerId(
      share.resourceType,
      share.resourceId,
    );
    if (!ownerId) {
      throw new NotFoundException('Shared resource not found');
    }
    return share;
  }

  async isFolderWithinShareScope(
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

  private async hasValidPublicShareToken(
    token: string,
    resource: ResourceRef,
  ): Promise<boolean> {
    try {
      const share = await this.getValidatedPublicShare(token);
      if (
        share.resourceType === resource.resourceType &&
        share.resourceId === resource.resourceId
      ) {
        return true;
      }
      if (
        share.resourceType === 'DATA_ROOM' &&
        resource.resourceType !== 'DATA_ROOM'
      ) {
        return this.isResourceWithinDataRoom(resource, share.resourceId);
      }
      if (share.resourceType === 'FOLDER') {
        if (resource.resourceType === 'FOLDER') {
          return (
            share.resourceId === resource.resourceId ||
            (await this.isDescendantOf(resource.resourceId, share.resourceId))
          );
        }
        if (resource.resourceType === 'FILE') {
          const file = await this.prisma.findFileById(resource.resourceId);
          if (!file) {
            return false;
          }
          return (
            file.folderId === share.resourceId ||
            (await this.isDescendantOf(file.folderId, share.resourceId))
          );
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  private async hasDirectUserShare(
    userId: string,
    resource: ResourceRef,
  ): Promise<boolean> {
    return this.hasUserShare(
      userId,
      resource.resourceType,
      resource.resourceId,
    );
  }

  private async hasInheritedUserShare(
    userId: string,
    resource: ResourceRef,
  ): Promise<boolean> {
    switch (resource.resourceType) {
      case 'DATA_ROOM':
        return false;
      case 'FOLDER': {
        const folder = await this.prisma.findFolderWithOwner(
          resource.resourceId,
        );
        if (!folder) {
          return false;
        }
        if (await this.hasUserShare(userId, 'DATA_ROOM', folder.dataRoomId)) {
          return true;
        }
        return this.hasAncestorFolderUserShare(userId, folder);
      }
      case 'FILE': {
        const file = await this.prisma.findFileById(resource.resourceId);
        if (!file) {
          return false;
        }
        const folder = await this.prisma.findFolderWithOwner(file.folderId);
        if (!folder) {
          return false;
        }
        if (await this.hasUserShare(userId, 'FOLDER', file.folderId)) {
          return true;
        }
        if (await this.hasUserShare(userId, 'DATA_ROOM', folder.dataRoomId)) {
          return true;
        }
        return this.hasAncestorFolderUserShare(userId, folder);
      }
      default:
        return false;
    }
  }

  private async getResourceOwnerId(
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

  private async isResourceWithinDataRoom(
    resource: ResourceRef,
    dataRoomId: string,
  ): Promise<boolean> {
    switch (resource.resourceType) {
      case 'DATA_ROOM':
        return resource.resourceId === dataRoomId;
      case 'FOLDER': {
        const folder = await this.prisma.findFolderById(resource.resourceId);
        return folder?.dataRoomId === dataRoomId;
      }
      case 'FILE': {
        const file = await this.prisma.findFileById(resource.resourceId);
        if (!file) {
          return false;
        }
        const folder = await this.prisma.findFolderById(file.folderId);
        return folder?.dataRoomId === dataRoomId;
      }
      default:
        return false;
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

  private async hasAncestorFolderUserShare(
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

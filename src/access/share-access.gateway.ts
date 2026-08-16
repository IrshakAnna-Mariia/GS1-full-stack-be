import type { ShareEntity, ShareResourceType } from '../common/entities';

export abstract class ShareAccessGateway {
  abstract assertResourceOwner(
    userId: string,
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<void>;

  abstract assertCanWrite(userId: string, ownerId: string): void;

  abstract canReadFolder(userId: string, folderId: string): Promise<boolean>;

  abstract canReadFile(userId: string, fileId: string): Promise<boolean>;

  abstract getValidatedPublicShare(token: string): Promise<ShareEntity>;

  abstract isFolderWithinShareScope(
    share: ShareEntity,
    folderId: string,
  ): Promise<boolean>;
}

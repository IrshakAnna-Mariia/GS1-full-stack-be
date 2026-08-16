import type { FileEntity, FolderWithDataRoomOwner } from '../common/entities';
import type { ResourceAction } from './resource-access.types';

export abstract class ResourceAccessGateway {
  abstract assertFolderAccess(
    userId: string,
    folderId: string,
    action: ResourceAction,
  ): Promise<FolderWithDataRoomOwner>;

  abstract assertFileAccess(
    userId: string,
    fileId: string,
    action: ResourceAction,
  ): Promise<FileEntity>;
}

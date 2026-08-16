import type { FileEntity, FolderWithDataRoomOwner } from '../common/entities';

export abstract class ResourceAccessGateway {
  abstract getFolderForRead(
    userId: string,
    folderId: string,
  ): Promise<FolderWithDataRoomOwner>;

  abstract getFolderForWrite(
    userId: string,
    folderId: string,
  ): Promise<FolderWithDataRoomOwner>;

  abstract getFileForRead(userId: string, fileId: string): Promise<FileEntity>;

  abstract getFileForWrite(userId: string, fileId: string): Promise<FileEntity>;
}

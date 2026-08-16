import type { FolderEntity } from '../../common/entities';

export type FolderDto = {
  id: string;
  name: string;
  dataRoomId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toFolderDto(folder: FolderEntity): FolderDto {
  return {
    id: folder.id,
    name: folder.name,
    dataRoomId: folder.dataRoomId,
    parentId: folder.parentId,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
  };
}

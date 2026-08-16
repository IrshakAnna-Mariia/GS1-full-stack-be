import type { FileEntity } from '../../common/entities';

export type FileDto = {
  id: string;
  name: string;
  storageKey: string;
  mimeType: string;
  size: number;
  folderId: string;
  createdAt: Date;
  updatedAt: Date;
};

export function toFileDto(file: FileEntity): FileDto {
  return {
    id: file.id,
    name: file.name,
    storageKey: file.storageKey,
    mimeType: file.mimeType,
    size: file.size,
    folderId: file.folderId,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  };
}

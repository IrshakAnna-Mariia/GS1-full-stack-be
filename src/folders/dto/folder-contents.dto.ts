import type { FileDto } from '../../files/dto/file.dto';
import type { FolderDto } from './folder.dto';

export type FolderContentsDto = {
  folder: FolderDto;
  folders: FolderDto[];
  files: FileDto[];
};

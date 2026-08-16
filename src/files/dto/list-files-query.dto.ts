import { IsUUID } from 'class-validator';

export class ListFilesQueryDto {
  @IsUUID()
  declare folderId: string;
}

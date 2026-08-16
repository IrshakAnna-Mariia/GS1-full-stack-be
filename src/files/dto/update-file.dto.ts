import { IsUUID } from 'class-validator';

export class UpdateFileDto {
  @IsUUID()
  declare folderId: string;
}

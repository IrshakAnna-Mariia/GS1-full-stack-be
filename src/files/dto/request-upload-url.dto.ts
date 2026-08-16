import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, ValidateIf } from 'class-validator';
import { FOLDER_TARGET_HELP, remapFolderIdTransform } from './folder-target';

export class RequestUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @Transform(remapFolderIdTransform)
  @ValidateIf((dto: RequestUploadUrlDto) => !dto.folderName)
  @IsUUID(undefined, { message: FOLDER_TARGET_HELP })
  folderId?: string;

  @ValidateIf((dto: RequestUploadUrlDto) => !dto.folderId)
  @IsString()
  @IsNotEmpty()
  folderName?: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;
}

import { Transform } from 'class-transformer';
import {
  Allow,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { FOLDER_TARGET_HELP, remapFolderIdTransform } from './folder-target';

export class CreateFileDto {
  @Allow()
  fileName?: string;

  @Transform(({ obj }: { obj: Record<string, unknown> }) =>
    typeof obj.name === 'string' ? obj.name : obj.fileName,
  )
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Transform(remapFolderIdTransform)
  @ValidateIf((dto: CreateFileDto) => !dto.folderName)
  @IsUUID(undefined, { message: FOLDER_TARGET_HELP })
  folderId?: string;

  @ValidateIf((dto: CreateFileDto) => !dto.folderId)
  @IsString()
  @IsNotEmpty()
  folderName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  storageKey?: string;

  @IsOptional()
  @IsString()
  contentType?: string;
}

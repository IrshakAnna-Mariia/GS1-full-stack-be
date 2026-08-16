import { Transform } from 'class-transformer';
import {
  Allow,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { trimOptionalStringTransform } from '../../common/utils/trim-optional-string';
import {
  FOLDER_TARGET_HELP,
  shouldValidateFolderId,
} from '../utils/folder-target';

export class CreateFileDto {
  @Allow()
  fileName?: string;

  @Transform(({ obj }: { obj: Record<string, unknown> }) =>
    typeof obj.name === 'string' ? obj.name : obj.fileName,
  )
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Transform(trimOptionalStringTransform)
  @ValidateIf(shouldValidateFolderId)
  @IsUUID(undefined, { message: FOLDER_TARGET_HELP })
  folderId?: string;

  @Transform(trimOptionalStringTransform)
  @IsOptional()
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

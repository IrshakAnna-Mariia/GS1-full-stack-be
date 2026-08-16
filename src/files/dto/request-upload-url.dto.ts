import { Transform } from 'class-transformer';
import {
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

export class RequestUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @Transform(trimOptionalStringTransform)
  @ValidateIf(shouldValidateFolderId)
  @IsUUID(undefined, { message: FOLDER_TARGET_HELP })
  folderId?: string;

  @Transform(trimOptionalStringTransform)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  folderName?: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;
}

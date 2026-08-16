import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Validate,
  ValidateIf,
} from 'class-validator';
import {
  HasFolderTargetConstraint,
  trimOptionalStringTransform,
} from './has-folder-target.constraint';
import {
  FOLDER_TARGET_HELP,
  shouldValidateFolderId,
} from '../utils/folder-target';

export class RequestUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  @Validate(HasFolderTargetConstraint)
  fileName!: string;

  @Transform(trimOptionalStringTransform)
  @ValidateIf(shouldValidateFolderId)
  @IsUUID(undefined, { message: FOLDER_TARGET_HELP })
  folderId?: string;

  @Transform(trimOptionalStringTransform)
  folderName?: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;
}

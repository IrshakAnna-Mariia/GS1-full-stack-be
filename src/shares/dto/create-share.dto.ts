import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import type { ShareResourceType, ShareType } from '../../common/entities';

enum ShareResourceTypeEnum {
  DATA_ROOM = 'DATA_ROOM',
  FOLDER = 'FOLDER',
  FILE = 'FILE',
}

enum ShareTypeEnum {
  PUBLIC = 'PUBLIC',
  USER = 'USER',
}

export class CreateShareDto {
  @IsEnum(ShareResourceTypeEnum)
  resourceType: ShareResourceType;

  @IsUUID()
  resourceId: string;

  @IsEnum(ShareTypeEnum)
  shareType: ShareType;

  @ValidateIf((dto: CreateShareDto) => dto.shareType === 'USER')
  @IsEmail()
  @IsNotEmpty()
  email?: string;
}

enum ShareResourceTypeQueryEnum {
  DATA_ROOM = 'DATA_ROOM',
  FOLDER = 'FOLDER',
  FILE = 'FILE',
}

export class ListSharesQueryDto {
  @IsEnum(ShareResourceTypeQueryEnum)
  resourceType: ShareResourceType;

  @IsUUID()
  resourceId: string;
}

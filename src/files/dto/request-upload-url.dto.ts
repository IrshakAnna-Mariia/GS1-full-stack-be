import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RequestUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsUUID()
  folderId!: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;
}

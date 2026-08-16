import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ResourceAccessGateway } from '../access/resource-access.gateway';
import { DataRoomService } from '../data-room/data-room.service';
import {
  DEFAULT_ROOT_FOLDER_NAME,
  getOrCreateRootFolderByName,
} from '../folders/utils/root-folder';
import { DatabaseGateway } from '../prisma/database.gateway';
import { StorageGateway } from '../storage/storage.gateway';
import type { CreateFileDto } from './dto/create-file.dto';
import type { CreateFileResponseDto } from './dto/create-file-response.dto';
import { FileDto, toFileDto } from './dto/file.dto';
import type { RequestUploadUrlDto } from './dto/request-upload-url.dto';
import type { UpdateFileDto } from './dto/update-file.dto';
import type { UploadUrlResponseDto } from './dto/upload-url-response.dto';
import type { FolderTargetInput } from './utils/folder-target';
import { normalizeFolderTarget } from './utils/folder-target';
import { FilesRepository } from './files.repository';

@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly resourceAccess: ResourceAccessGateway,
    private readonly storageService: StorageGateway,
    private readonly dataRoomService: DataRoomService,
    private readonly prisma: DatabaseGateway,
  ) {}

  async findByFolder(userId: string, folderId: string): Promise<FileDto[]> {
    await this.resourceAccess.assertFolderAccess(userId, folderId, 'read');

    const files = await this.filesRepository.findByFolder(folderId);

    return files.map((file) => toFileDto(file));
  }

  async requestUploadUrl(
    userId: string,
    dto: RequestUploadUrlDto,
  ): Promise<UploadUrlResponseDto> {
    const folderId = await this.resolveFolderId(userId, dto);

    await this.resourceAccess.assertFolderAccess(userId, folderId, 'upload');

    const storageKey = this.filesRepository.buildStorageKey(
      userId,
      folderId,
      dto.fileName,
    );

    const uploadUrl =
      await this.storageService.createUploadSignedUrl(storageKey);
    if (!uploadUrl) {
      throw new InternalServerErrorException('Failed to create upload URL');
    }

    return { uploadUrl, storageKey };
  }

  async create(
    userId: string,
    dto: CreateFileDto,
  ): Promise<CreateFileResponseDto> {
    const folderId = await this.resolveFolderId(userId, dto);

    await this.resourceAccess.assertFolderAccess(userId, folderId, 'upload');

    const storageKey =
      dto.storageKey ??
      this.filesRepository.buildStorageKey(userId, folderId, dto.name);

    if (
      dto.storageKey &&
      !this.isStorageKeyForFolder(userId, folderId, dto.storageKey)
    ) {
      throw new ForbiddenException('Invalid storage key for this folder');
    }

    const file = await this.filesRepository.create({
      name: dto.name,
      storageKey,
      mimeType: dto.contentType ?? this.inferMimeType(dto.name),
      size: 0,
      folderId,
    });

    const response = toFileDto(file);

    if (dto.storageKey) {
      return response;
    }

    const uploadUrl =
      await this.storageService.createUploadSignedUrl(storageKey);
    if (!uploadUrl) {
      throw new InternalServerErrorException('Failed to create upload URL');
    }

    return { ...response, uploadUrl };
  }

  async getDownloadUrl(
    userId: string,
    fileId: string,
  ): Promise<{ signedUrl: string | null }> {
    const file = await this.resourceAccess.assertFileAccess(
      userId,
      fileId,
      'read',
    );
    const signedUrl = await this.storageService.createSignedUrl(
      file.storageKey,
    );
    return { signedUrl };
  }

  async update(
    userId: string,
    fileId: string,
    dto: UpdateFileDto,
  ): Promise<FileDto> {
    if (!dto.name && !dto.folderId) {
      throw new BadRequestException('Provide name or folderId to update');
    }

    if (dto.name && dto.folderId) {
      throw new BadRequestException('Provide only one of name or folderId');
    }

    if (dto.name) {
      await this.resourceAccess.assertFileAccess(userId, fileId, 'rename');
      const updated = await this.filesRepository.updateName(fileId, dto.name);
      return toFileDto(updated);
    }

    return this.move(userId, fileId, { folderId: dto.folderId! });
  }

  async move(
    userId: string,
    fileId: string,
    dto: Pick<UpdateFileDto, 'folderId'>,
  ): Promise<FileDto> {
    const file = await this.resourceAccess.assertFileAccess(
      userId,
      fileId,
      'move',
    );
    const sourceFolder = await this.resourceAccess.assertFolderAccess(
      userId,
      file.folderId,
      'move',
    );
    const targetFolder = await this.resourceAccess.assertFolderAccess(
      userId,
      dto.folderId!,
      'move',
    );

    if (file.folderId === dto.folderId) {
      throw new BadRequestException('File is already in this folder');
    }

    if (sourceFolder.dataRoomId !== targetFolder.dataRoomId) {
      throw new BadRequestException(
        'Target folder must belong to the same data room',
      );
    }

    const updated = await this.filesRepository.updateFolderId(
      fileId,
      dto.folderId!,
    );

    return toFileDto(updated);
  }

  async remove(userId: string, fileId: string): Promise<FileDto> {
    const file = await this.resourceAccess.assertFileAccess(
      userId,
      fileId,
      'delete',
    );

    await this.storageService.deleteObjects([file.storageKey]);
    const deleted = await this.filesRepository.delete(fileId);

    return toFileDto(deleted);
  }

  private async resolveFolderId(
    userId: string,
    dto: FolderTargetInput,
  ): Promise<string> {
    const { folderId, folderName } = normalizeFolderTarget(dto);

    if (folderId) {
      return folderId;
    }

    const dataRoom = await this.dataRoomService.getOrCreateForUser(userId);
    const targetFolderName = folderName ?? DEFAULT_ROOT_FOLDER_NAME;

    return getOrCreateRootFolderByName(
      this.prisma,
      dataRoom.id,
      targetFolderName,
    );
  }

  private isStorageKeyForFolder(
    userId: string,
    folderId: string,
    storageKey: string,
  ): boolean {
    return storageKey.startsWith(`${userId}/${folderId}/`);
  }

  private inferMimeType(fileName: string): string {
    return fileName.toLowerCase().endsWith('.pdf')
      ? 'application/pdf'
      : 'application/octet-stream';
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { ResourceAccessGateway } from '../access/resource-access.gateway';
import { StorageGateway } from '../storage/storage.gateway';
import { FileDto, toFileDto } from './dto/file.dto';
import type { UpdateFileDto } from './dto/update-file.dto';
import { FilesRepository } from './files.repository';

@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly resourceAccess: ResourceAccessGateway,
    private readonly storageService: StorageGateway,
  ) {}

  async findByFolder(userId: string, folderId: string): Promise<FileDto[]> {
    await this.resourceAccess.getFolderForRead(userId, folderId);

    const files = await this.filesRepository.findByFolder(folderId);

    return files.map((file) => toFileDto(file));
  }

  async getDownloadUrl(
    userId: string,
    fileId: string,
  ): Promise<{ signedUrl: string | null }> {
    const file = await this.resourceAccess.getFileForRead(userId, fileId);
    const signedUrl = await this.storageService.createSignedUrl(
      file.storageKey,
    );
    return { signedUrl };
  }

  async move(
    userId: string,
    fileId: string,
    dto: UpdateFileDto,
  ): Promise<FileDto> {
    const file = await this.resourceAccess.getFileForWrite(userId, fileId);
    const sourceFolder = await this.resourceAccess.getFolderForWrite(
      userId,
      file.folderId,
    );
    const targetFolder = await this.resourceAccess.getFolderForWrite(
      userId,
      dto.folderId,
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
      dto.folderId,
    );

    return toFileDto(updated);
  }
}

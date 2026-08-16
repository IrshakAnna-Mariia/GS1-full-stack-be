import { BadRequestException, Injectable } from '@nestjs/common';
import { ResourceAccessService } from '../access/resource-access.service';
import { FileDto, toFileDto } from './dto/file.dto';
import type { UpdateFileDto } from './dto/update-file.dto';
import { FilesRepository } from './files.repository';

@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly resourceAccess: ResourceAccessService,
  ) {}

  async findByFolder(userId: string, folderId: string): Promise<FileDto[]> {
    await this.resourceAccess.getFolderForUser(userId, folderId);

    const files = await this.filesRepository.findByFolder(folderId);

    return files.map((file) => toFileDto(file));
  }

  async move(
    userId: string,
    fileId: string,
    dto: UpdateFileDto,
  ): Promise<FileDto> {
    const file = await this.resourceAccess.getFileForUser(userId, fileId);
    const sourceFolder = await this.resourceAccess.getFolderForUser(
      userId,
      file.folderId,
    );
    const targetFolder = await this.resourceAccess.getFolderForUser(
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

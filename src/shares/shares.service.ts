import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShareAccessGateway } from '../access/share-access.gateway';
import { toDataRoomDto } from '../data-room/dto/data-room.dto';
import { toFileDto } from '../files/dto/file.dto';
import type { FolderContentsDto } from '../folders/dto/folder-contents.dto';
import { toFolderDto } from '../folders/dto/folder.dto';
import { DatabaseGateway } from '../prisma/database.gateway';
import { StorageGateway } from '../storage/storage.gateway';
import { SupabaseGateway } from '../supabase/supabase.gateway';
import type { ShareEntity } from '../common/entities';
import type { CreateShareDto } from './dto/create-share.dto';
import { ShareDto, toShareDto } from './dto/share.dto';
import { SharesRepository } from './shares.repository';

type PublicFileDto = ReturnType<typeof toFileDto> & {
  downloadUrl: string | null;
};

@Injectable()
export class SharesService {
  constructor(
    private readonly sharesRepository: SharesRepository,
    private readonly shareAccess: ShareAccessGateway,
    private readonly supabaseService: SupabaseGateway,
    private readonly prisma: DatabaseGateway,
    private readonly storageService: StorageGateway,
  ) {}

  async create(userId: string, dto: CreateShareDto): Promise<ShareDto> {
    await this.shareAccess.assertResourceOwner(
      userId,
      dto.resourceType,
      dto.resourceId,
    );

    if (dto.shareType === 'USER') {
      if (!dto.email) {
        throw new BadRequestException('Email is required for user shares');
      }

      const recipientId = await this.supabaseService.findUserIdByEmail(
        dto.email,
      );
      if (!recipientId) {
        throw new NotFoundException('User with this email was not found');
      }
      if (recipientId === userId) {
        throw new BadRequestException(
          'You cannot share a resource with yourself',
        );
      }

      const share = await this.sharesRepository.create({
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        type: 'USER',
        userId: recipientId,
        createdBy: userId,
      });

      return toShareDto(share, { recipientEmail: dto.email.toLowerCase() });
    }

    const share = await this.sharesRepository.create({
      resourceType: dto.resourceType,
      resourceId: dto.resourceId,
      type: 'PUBLIC',
      createdBy: userId,
    });

    return toShareDto(share, {
      publicUrl: this.buildPublicUrl(share.token),
    });
  }

  async listForResource(
    userId: string,
    resourceType: CreateShareDto['resourceType'],
    resourceId: string,
  ): Promise<ShareDto[]> {
    await this.shareAccess.assertResourceOwner(
      userId,
      resourceType,
      resourceId,
    );

    const shares = await this.sharesRepository.findByResource(
      resourceType,
      resourceId,
    );

    return Promise.all(shares.map(async (share) => this.enrichShareDto(share)));
  }

  async revoke(userId: string, shareId: string): Promise<ShareDto> {
    const share = await this.sharesRepository.findById(shareId);
    if (!share) {
      throw new NotFoundException('Share not found');
    }

    await this.shareAccess.assertResourceOwner(
      userId,
      share.resourceType,
      share.resourceId,
    );

    const deleted = await this.sharesRepository.delete(shareId);
    return toShareDto(deleted);
  }

  async getPublicShare(token: string) {
    const share = await this.shareAccess.getValidatedPublicShare(token);

    switch (share.resourceType) {
      case 'DATA_ROOM':
        return this.buildPublicDataRoomView(share);
      case 'FOLDER':
        return this.buildPublicFolderView(share, share.resourceId);
      case 'FILE':
        return this.buildPublicFileView(share);
      default:
        throw new NotFoundException('Share not found');
    }
  }

  async getPublicFolderContents(
    token: string,
    folderId: string,
  ): Promise<FolderContentsDto & { files: PublicFileDto[] }> {
    const share = await this.shareAccess.getValidatedPublicShare(token);

    if (share.resourceType === 'FILE') {
      throw new NotFoundException('Folder not found');
    }

    const allowed = await this.shareAccess.isFolderWithinShareScope(
      share,
      folderId,
    );
    if (!allowed) {
      throw new NotFoundException('Folder not found');
    }

    return this.buildPublicFolderContents(folderId);
  }

  private async buildPublicDataRoomView(
    share: ShareDto | { resourceId: string },
  ) {
    const dataRoom = await this.prisma.findDataRoomById(share.resourceId);
    if (!dataRoom) {
      throw new NotFoundException('Shared resource not found');
    }

    const folders = await this.prisma.findFolders({
      where: { dataRoomId: dataRoom.id, parentId: null },
      orderBy: { name: 'asc' },
    });

    return {
      resourceType: 'DATA_ROOM' as const,
      dataRoom: toDataRoomDto(dataRoom),
      folders: folders.map((folder) => toFolderDto(folder)),
      files: [],
    };
  }

  private async buildPublicFolderView(
    share: { resourceType: string; resourceId: string; token: string | null },
    folderId: string,
  ) {
    const contents = await this.buildPublicFolderContents(folderId);
    return {
      resourceType: 'FOLDER' as const,
      token: share.token,
      ...contents,
    };
  }

  private async buildPublicFolderContents(folderId: string) {
    const folder = await this.prisma.findFolderById(folderId);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const [childFolders, files] = await Promise.all([
      this.prisma.findFolders({
        where: { parentId: folderId },
        orderBy: { name: 'asc' },
      }),
      this.prisma.findFiles({
        where: { folderId },
        orderBy: { name: 'asc' },
      }),
    ]);

    const filesWithUrls = await Promise.all(
      files.map(async (file) => ({
        ...toFileDto(file),
        downloadUrl: await this.storageService.createSignedUrl(file.storageKey),
      })),
    );

    return {
      folder: toFolderDto(folder),
      folders: childFolders.map((child) => toFolderDto(child)),
      files: filesWithUrls,
    };
  }

  private async buildPublicFileView(share: {
    resourceId: string;
    token: string | null;
  }) {
    const file = await this.prisma.findFileById(share.resourceId);
    if (!file) {
      throw new NotFoundException('Shared resource not found');
    }

    return {
      resourceType: 'FILE' as const,
      token: share.token,
      file: {
        ...toFileDto(file),
        downloadUrl: await this.storageService.createSignedUrl(file.storageKey),
      },
    };
  }

  private async enrichShareDto(share: ShareEntity): Promise<ShareDto> {
    if (share.type === 'PUBLIC') {
      return toShareDto(share, {
        publicUrl: this.buildPublicUrl(share.token),
      });
    }

    if (share.userId) {
      const recipientEmail = await this.supabaseService.getUserEmailById(
        share.userId,
      );
      return toShareDto(share, { recipientEmail });
    }

    return toShareDto(share);
  }

  private buildPublicUrl(token: string | null): string | null {
    if (!token) {
      return null;
    }
    return `/public/shares/${token}`;
  }
}

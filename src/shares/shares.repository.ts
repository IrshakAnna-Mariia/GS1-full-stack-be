import { randomBytes } from 'node:crypto';
import { ConflictException, Injectable } from '@nestjs/common';
import type {
  ShareEntity,
  ShareResourceType,
  ShareType,
} from '../common/entities';
import { DatabaseGateway } from '../prisma/database.gateway';

export type CreateShareInput = {
  resourceType: ShareResourceType;
  resourceId: string;
  type: ShareType;
  userId?: string | null;
  createdBy: string;
};

@Injectable()
export class SharesRepository {
  constructor(private readonly prisma: DatabaseGateway) {}

  findByResource(
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<ShareEntity[]> {
    return this.prisma.findSharesByResource(resourceType, resourceId);
  }

  findById(id: string): Promise<ShareEntity | null> {
    return this.prisma.findShareById(id);
  }

  findByToken(token: string): Promise<ShareEntity | null> {
    return this.prisma.findShareByToken(token);
  }

  findPublicShare(
    resourceType: ShareResourceType,
    resourceId: string,
  ): Promise<ShareEntity | null> {
    return this.prisma.findPublicShare(resourceType, resourceId);
  }

  findUserShare(
    resourceType: ShareResourceType,
    resourceId: string,
    userId: string,
  ): Promise<ShareEntity | null> {
    return this.prisma.findUserShare(resourceType, resourceId, userId);
  }

  async create(input: CreateShareInput): Promise<ShareEntity> {
    if (input.type === 'PUBLIC') {
      const existing = await this.findPublicShare(
        input.resourceType,
        input.resourceId,
      );
      if (existing) {
        throw new ConflictException(
          'A public share already exists for this resource',
        );
      }
    }

    if (input.type === 'USER' && input.userId) {
      const existing = await this.findUserShare(
        input.resourceType,
        input.resourceId,
        input.userId,
      );
      if (existing) {
        return existing;
      }
    }

    return this.prisma.createShare({
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      type: input.type,
      permission: 'VIEWER',
      userId: input.type === 'USER' ? input.userId : null,
      token: input.type === 'PUBLIC' ? this.generateToken() : null,
      createdBy: input.createdBy,
    });
  }

  delete(id: string): Promise<ShareEntity> {
    return this.prisma.deleteShare(id);
  }

  private generateToken(): string {
    return randomBytes(32).toString('base64url');
  }
}

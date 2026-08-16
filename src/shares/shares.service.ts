import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShareDto, toShareDto } from './dto/share.dto';

@Injectable()
export class SharesService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string): Promise<ShareDto[]> {
    const shares = await this.prisma.share.findMany({
      where: {
        OR: [{ userId }, { createdBy: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });

    return shares.map((share) => toShareDto(share));
  }
}

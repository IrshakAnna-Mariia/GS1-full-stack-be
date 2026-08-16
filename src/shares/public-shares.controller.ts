import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { SharesService } from './shares.service';

@Controller('public/shares')
export class PublicSharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Public()
  @Get(':token')
  getPublicShare(@Param('token') token: string) {
    return this.sharesService.getPublicShare(token);
  }

  @Public()
  @Get(':token/folders/:folderId/contents')
  getPublicFolderContents(
    @Param('token') token: string,
    @Param('folderId', ParseUUIDPipe) folderId: string,
  ) {
    return this.sharesService.getPublicFolderContents(token, folderId);
  }
}

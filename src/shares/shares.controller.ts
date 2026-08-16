import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateShareDto, ListSharesQueryDto } from './dto/create-share.dto';
import { SharesService } from './shares.service';

@Controller('shares')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateShareDto) {
    return this.sharesService.create(user.id, dto);
  }

  @Get()
  listForResource(
    @CurrentUser() user: User,
    @Query() query: ListSharesQueryDto,
  ) {
    return this.sharesService.listForResource(
      user.id,
      query.resourceType,
      query.resourceId,
    );
  }

  @Delete(':id')
  revoke(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.sharesService.revoke(user.id, id);
  }
}

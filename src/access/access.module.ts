import { Global, Module } from '@nestjs/common';
import { ResourceAccessControlGateway } from './resource-access-control.gateway';
import { ResourceAccessControlService } from './resource-access-control.service';
import { ResourceAccessGateway } from './resource-access.gateway';
import { ResourceAccessService } from './resource-access.service';
import { ResourceAccessGuard } from './guards/resource-access.guard';
import { ShareAccessGateway } from './share-access.gateway';
import { ShareAccessService } from './share-access.service';

@Global()
@Module({
  providers: [
    ResourceAccessControlService,
    {
      provide: ResourceAccessControlGateway,
      useExisting: ResourceAccessControlService,
    },
    ShareAccessService,
    { provide: ShareAccessGateway, useExisting: ShareAccessService },
    ResourceAccessService,
    { provide: ResourceAccessGateway, useExisting: ResourceAccessService },
    ResourceAccessGuard,
  ],
  exports: [
    ResourceAccessControlService,
    ResourceAccessControlGateway,
    ShareAccessService,
    ShareAccessGateway,
    ResourceAccessService,
    ResourceAccessGateway,
    ResourceAccessGuard,
  ],
})
export class AccessModule {}

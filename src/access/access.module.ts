import { Global, Module } from '@nestjs/common';
import { ResourceAccessGateway } from './resource-access.gateway';
import { ResourceAccessService } from './resource-access.service';
import { ShareAccessGateway } from './share-access.gateway';
import { ShareAccessService } from './share-access.service';

@Global()
@Module({
  providers: [
    ShareAccessService,
    { provide: ShareAccessGateway, useExisting: ShareAccessService },
    ResourceAccessService,
    { provide: ResourceAccessGateway, useExisting: ResourceAccessService },
  ],
  exports: [
    ShareAccessService,
    ShareAccessGateway,
    ResourceAccessService,
    ResourceAccessGateway,
  ],
})
export class AccessModule {}

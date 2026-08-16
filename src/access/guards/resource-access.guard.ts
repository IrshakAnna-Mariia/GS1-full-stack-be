import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ResourceAccessControlGateway } from '../resource-access-control.gateway';
import {
  RESOURCE_ACCESS_KEY,
  type ResourceAccessMetadata,
} from '../decorators/resource-access.decorator';
import type { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';

@Injectable()
export class ResourceAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessControl: ResourceAccessControlGateway,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<ResourceAccessMetadata>(
      RESOURCE_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rawResourceId = request.params[metadata.resourceIdParam];
    const resourceId = Array.isArray(rawResourceId)
      ? rawResourceId[0]
      : rawResourceId;
    if (!resourceId) {
      throw new NotFoundException('Resource not found');
    }

    await this.accessControl.assertCanPerformAction(
      { id: user.id },
      {
        resourceType: metadata.resourceType,
        resourceId,
      },
      metadata.action,
    );

    return true;
  }
}

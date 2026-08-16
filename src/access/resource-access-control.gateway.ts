import type { ShareEntity } from '../common/entities';
import type {
  ResourceAccessOptions,
  ResourceAccessResult,
  ResourceAction,
  ResourceRef,
} from './resource-access.types';
import type { AccessUser } from './resource-access.types';

export abstract class ResourceAccessControlGateway {
  abstract canAccessResource(
    user: AccessUser | null,
    resource: ResourceRef,
    options?: ResourceAccessOptions,
  ): Promise<ResourceAccessResult>;

  abstract canPerformAction(
    access: ResourceAccessResult,
    action: ResourceAction,
  ): boolean;

  abstract assertCanPerformAction(
    user: AccessUser | null,
    resource: ResourceRef,
    action: ResourceAction,
    options?: ResourceAccessOptions,
  ): Promise<ResourceAccessResult>;

  abstract getValidatedPublicShare(token: string): Promise<ShareEntity>;

  abstract isFolderWithinShareScope(
    share: ShareEntity,
    folderId: string,
  ): Promise<boolean>;
}

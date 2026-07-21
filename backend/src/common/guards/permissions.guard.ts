import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { hasPermission } from "../constants/permissions";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import type { AuthenticatedUser } from "../interfaces/authenticated-user.interface";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    if (!user || !required.every((permission) => hasPermission(user.role, user.permissions, permission))) {
      throw new ForbiddenException("Não tem permissão para executar esta ação.");
    }
    return true;
  }
}

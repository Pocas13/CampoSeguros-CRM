import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { AuthenticatedUser } from "../interfaces/authenticated-user.interface";

const ACCESS_COOKIE = "insureflow_access_token";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: AuthenticatedUser;
    }>();

    const authorization = request.headers.authorization;
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;
    const cookieToken = this.readCookie(request.headers.cookie, ACCESS_COOKIE);
    const token = bearerToken || cookieToken;

    if (!token) {
      throw new UnauthorizedException("Sessão não iniciada.");
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: number }>(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          companyId: true,
          permissions: true,
          active: true,
          avatarUrl: true,
          phone: true,
          jobTitle: true,
          company: { select: { status: true } },
        },
      });

      if (!user?.active) {
        throw new UnauthorizedException("Utilizador inativo.");
      }
      if (user.company && ["SUSPENDED", "CANCELLED"].includes(user.company.status)) {
        throw new UnauthorizedException("A organização está suspensa ou inativa.");
      }

      const { company: _company, ...authenticatedUser } = user;
      request.user = authenticatedUser;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException("Sessão expirada ou inválida.");
    }
  }

  private readCookie(header: string | undefined, name: string) {
    if (!header) return null;

    for (const part of header.split(";")) {
      const [key, ...valueParts] = part.trim().split("=");
      if (key === name) {
        return decodeURIComponent(valueParts.join("="));
      }
    }

    return null;
  }
}

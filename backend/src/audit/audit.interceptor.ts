import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import type { Request } from "express";
import { Observable, tap } from "rxjs";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { AuditService } from "./audit.service";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    if (!["POST", "PATCH", "PUT", "DELETE"].includes(request.method)) return next.handle();

    const started = Date.now();
    return next.handle().pipe(
      tap((response) => {
        const segments = request.path.split("/").filter(Boolean);
        const entity = segments[0] || "unknown";
        const entityId = segments.find((part) => /^\d+$/.test(part));
        void this.audit.log({
          companyId: request.user?.companyId,
          userId: request.user?.id,
          action: `${request.method} ${request.path}`,
          method: request.method,
          path: request.originalUrl,
          entity,
          entityId,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
          metadata: {
            durationMs: Date.now() - started,
            resultId: response && typeof response === "object" && "id" in response ? String((response as { id: unknown }).id) : null,
          },
        });
      }),
    );
  }
}

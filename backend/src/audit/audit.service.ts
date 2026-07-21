import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    companyId?: number | null;
    userId?: number | null;
    action: string;
    method: string;
    path: string;
    entity?: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          companyId: data.companyId || null,
          userId: data.userId || null,
          action: data.action,
          method: data.method,
          path: data.path,
          entity: data.entity || null,
          entityId: data.entityId || null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          metadata: data.metadata,
        },
      });
    } catch {
      // A auditoria nunca deve bloquear a operação principal.
    }
  }

  async list(companyId: number, take = 100) {
    const rows = await this.prisma.auditLog.findMany({
      where: { companyId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: Math.min(Math.max(take, 1), 500),
    });
    return rows.map((row) => ({ ...row, id: row.id.toString() }));
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { hasPermission, PERMISSIONS } from "../common/constants/permissions";
import { requireCompanyId } from "../common/utils/tenant";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCalendarEventDto } from "./dto/create-calendar-event.dto";
import { UpdateCalendarEventDto } from "./dto/update-calendar-event.dto";

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async findRange(user: AuthenticatedUser, from?: string, to?: string) {
    const start = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = to ? new Date(to) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 7);
    const companyId = requireCompanyId(user);
    const employeeFilter = hasPermission(user.role, user.permissions, PERMISSIONS.VIEW_ALL_PROCESSES)
      ? {}
      : { OR: [{ assignedToId: user.id }, { createdById: user.id }] };
    const [events, renewals] = await Promise.all([
      this.prisma.calendarEvent.findMany({
        where: { companyId, startAt: { gte: start, lte: end }, ...employeeFilter },
        include: { client: true, policy: { include: { insurer: true } }, quote: true, assignedTo: { select: { id: true, name: true } } },
        orderBy: { startAt: "asc" },
      }),
      this.prisma.policy.findMany({
        where: { companyId, renewalDate: { gte: start, lte: end }, status: "ACTIVE" },
        include: { client: true, insurer: true },
        orderBy: { renewalDate: "asc" },
      }),
    ]);
    const linkedPolicyIds = new Set(events.filter((event) => event.type === "RENEWAL" && event.policyId).map((event) => event.policyId));
    const computed = renewals.filter((policy) => !linkedPolicyIds.has(policy.id)).map((policy) => ({
      id: `renewal-${policy.id}`,
      title: `Renovação ${policy.policyNumber}`,
      description: `${policy.client.name} · ${policy.insurer?.commercialName || policy.product}`,
      type: "RENEWAL", status: "PENDING", priority: "HIGH", startAt: policy.renewalDate, endAt: null,
      allDay: true, color: "#f59e0b", clientId: policy.clientId, policyId: policy.id, quoteId: null,
      client: policy.client, policy, quote: null, assignedTo: null, computed: true,
    }));
    return [...events, ...computed].sort((a, b) => new Date(a.startAt as Date).getTime() - new Date(b.startAt as Date).getTime());
  }

  upcoming(user: AuthenticatedUser, days = 30) {
    const start = new Date(); const end = new Date(); end.setDate(end.getDate() + days);
    return this.findRange(user, start.toISOString(), end.toISOString());
  }

  async create(user: AuthenticatedUser, dto: CreateCalendarEventDto) {
    const companyId = requireCompanyId(user);
    await this.validateRelations(dto, companyId);
    return this.prisma.calendarEvent.create({
      data: this.data(dto, companyId, user.id),
      include: { client: true, policy: true, quote: true, assignedTo: { select: { id: true, name: true } } },
    });
  }

  async update(user: AuthenticatedUser, id: number, dto: UpdateCalendarEventDto) {
    const companyId = requireCompanyId(user);
    await this.validateRelations(dto, companyId);
    const event = await this.prisma.calendarEvent.findFirst({ where: { id, companyId } });
    if (!event) throw new NotFoundException("Agendamento não encontrado.");
    return this.prisma.calendarEvent.update({
      where: { id }, data: this.data(dto, companyId, event.createdById ?? user.id),
      include: { client: true, policy: true, quote: true, assignedTo: { select: { id: true, name: true } } },
    });
  }

  async remove(user: AuthenticatedUser, id: number) {
    const event = await this.prisma.calendarEvent.findFirst({ where: { id, companyId: requireCompanyId(user) } });
    if (!event) throw new NotFoundException("Agendamento não encontrado.");
    return this.prisma.calendarEvent.delete({ where: { id } });
  }

  private async validateRelations(dto: Partial<CreateCalendarEventDto>, companyId: number) {
    const checks: Promise<unknown>[] = [];
    if (dto.clientId) checks.push(this.prisma.client.findFirst({ where: { id: dto.clientId, companyId } }));
    if (dto.policyId) checks.push(this.prisma.policy.findFirst({ where: { id: dto.policyId, companyId } }));
    if (dto.quoteId) checks.push(this.prisma.quote.findFirst({ where: { id: dto.quoteId, companyId } }));
    if (dto.assignedToId) checks.push(this.prisma.user.findFirst({ where: { id: dto.assignedToId, companyId, active: true } }));
    const results = await Promise.all(checks);
    if (results.some((item) => !item)) throw new NotFoundException("Um dos registos associados não pertence a esta organização.");
  }

  private data(dto: Partial<CreateCalendarEventDto>, companyId: number, createdById: number): Prisma.CalendarEventUncheckedCreateInput {
    return {
      title: dto.title?.trim() || "Agendamento",
      description: dto.description?.trim() || null,
      type: dto.type || "TASK", status: dto.status || "PENDING", priority: dto.priority || "NORMAL",
      startAt: dto.startAt ? new Date(dto.startAt) : new Date(), endAt: dto.endAt ? new Date(dto.endAt) : null,
      allDay: dto.allDay ?? false, color: dto.color || null,
      reminders: (dto.reminders ?? undefined) as Prisma.InputJsonValue | undefined,
      companyId, createdById, assignedToId: dto.assignedToId || createdById,
      clientId: dto.clientId || null, policyId: dto.policyId || null, quoteId: dto.quoteId || null,
    };
  }
}

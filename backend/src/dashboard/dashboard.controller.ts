import { Controller, Get } from "@nestjs/common";
import { hasPermission, PERMISSIONS } from "../common/constants/permissions";
import { requireCompanyId } from "../common/utils/tenant";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { PrismaService } from "../prisma/prisma.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async stats(@CurrentUser() user: AuthenticatedUser) {
    const companyId = requireCompanyId(user);
    const financialsVisible = hasPermission(user.role, user.permissions, PERMISSIONS.DASHBOARD_FINANCIALS);
    const canViewAll = hasPermission(user.role, user.permissions, PERMISSIONS.VIEW_ALL_PROCESSES);
    const now = new Date();
    const in60 = new Date(now); in60.setDate(now.getDate() + 60);
    const in30 = new Date(now); in30.setDate(now.getDate() + 30);
    const ownQuoteFilter = canViewAll ? {} : { createdById: user.id };
    const ownEventFilter = canViewAll
      ? {}
      : { OR: [{ assignedToId: user.id }, { createdById: user.id }] };

    const [clients, insurers, policies, claims, quotes, renewals, premium, recentQuotes, upcomingEvents] = await Promise.all([
      this.prisma.client.count({ where: { active: true, companyId } }),
      this.prisma.insurer.count({ where: { active: true } }),
      this.prisma.policy.count({ where: { status: "ACTIVE", companyId } }),
      this.prisma.claim.count({ where: { status: { not: "CLOSED" }, companyId } }),
      this.prisma.quote.count({ where: { companyId, status: { not: "CONVERTED" }, ...ownQuoteFilter } }),
      this.prisma.policy.findMany({
        where: { companyId, renewalDate: { gte: now, lte: in60 }, status: "ACTIVE" },
        include: { client: true, insurer: true },
        orderBy: { renewalDate: "asc" },
        take: 10,
      }),
      financialsVisible
        ? this.prisma.policy.aggregate({ _sum: { premium: true, commission: true }, where: { status: "ACTIVE", companyId } })
        : Promise.resolve({ _sum: { premium: null, commission: null } }),
      this.prisma.quote.findMany({
        where: { companyId, ...ownQuoteFilter },
        include: { client: true, offers: { include: { insurer: true } }, createdBy: { select: { id: true, name: true } } },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      this.prisma.calendarEvent.findMany({
        where: { companyId, startAt: { gte: now, lte: in30 }, status: { not: "DONE" }, ...ownEventFilter },
        include: { client: true, policy: true, quote: true, assignedTo: { select: { id: true, name: true } } },
        orderBy: { startAt: "asc" },
        take: 8,
      }),
    ]);

    return {
      clients,
      insurers,
      policies,
      claims,
      quotes,
      renewals,
      recentQuotes,
      upcomingEvents,
      financialsVisible,
      totalPremium: financialsVisible ? premium._sum.premium ?? 0 : null,
      totalCommission: financialsVisible ? premium._sum.commission ?? 0 : null,
      currentUser: { id: user.id, name: user.name, role: user.role },
    };
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export type GlobalSearchResult = {
  id: number;
  type: "CLIENT" | "POLICY" | "CLAIM" | "QUOTE";
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
};

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(companyId: number, rawQuery: string, rawLimit?: number) {
    const query = rawQuery.trim();
    const limit = Math.min(Math.max(rawLimit || 6, 1), 12);

    if (query.length < 2) {
      return { query, results: [] as GlobalSearchResult[] };
    }

    const [clients, policies, claims, quotes] = await Promise.all([
      this.prisma.client.findMany({
        where: {
          companyId,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { nif: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, nif: true, email: true, city: true, type: true, active: true },
        orderBy: [{ active: "desc" }, { name: "asc" }],
        take: limit,
      }),
      this.prisma.policy.findMany({
        where: {
          companyId,
          OR: [
            { policyNumber: { contains: query, mode: "insensitive" } },
            { proposalNumber: { contains: query, mode: "insensitive" } },
            { product: { contains: query, mode: "insensitive" } },
            { branch: { contains: query, mode: "insensitive" } },
            { client: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        select: {
          id: true,
          policyNumber: true,
          product: true,
          status: true,
          client: { select: { name: true } },
          insurer: { select: { commercialName: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      }),
      this.prisma.claim.findMany({
        where: {
          companyId,
          OR: [
            { claimNumber: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { client: { name: { contains: query, mode: "insensitive" } } },
            { policy: { policyNumber: { contains: query, mode: "insensitive" } } },
          ],
        },
        select: {
          id: true,
          claimNumber: true,
          status: true,
          client: { select: { name: true } },
          policy: { select: { policyNumber: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      }),
      this.prisma.quote.findMany({
        where: {
          companyId,
          OR: [
            { reference: { contains: query, mode: "insensitive" } },
            { title: { contains: query, mode: "insensitive" } },
            { productType: { contains: query, mode: "insensitive" } },
            { client: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        select: {
          id: true,
          reference: true,
          title: true,
          status: true,
          productType: true,
          client: { select: { name: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      }),
    ]);

    const results: GlobalSearchResult[] = [
      ...clients.map((client) => ({
        id: client.id,
        type: "CLIENT" as const,
        title: client.name,
        subtitle: [client.nif, client.email, client.city].filter(Boolean).join(" · ") || "Cliente",
        href: `/clients/${client.id}`,
        badge: client.type === "BUSINESS" ? "Empresa" : "Particular",
      })),
      ...policies.map((policy) => ({
        id: policy.id,
        type: "POLICY" as const,
        title: policy.policyNumber,
        subtitle: `${policy.client.name} · ${policy.product}${policy.insurer ? ` · ${policy.insurer.commercialName || policy.insurer.name}` : ""}`,
        href: `/policies/${policy.id}`,
        badge: policy.status,
      })),
      ...claims.map((claim) => ({
        id: claim.id,
        type: "CLAIM" as const,
        title: claim.claimNumber,
        subtitle: `${claim.client.name}${claim.policy ? ` · Apólice ${claim.policy.policyNumber}` : ""}`,
        href: `/claims/${claim.id}`,
        badge: claim.status,
      })),
      ...quotes.map((quote) => ({
        id: quote.id,
        type: "QUOTE" as const,
        title: quote.title,
        subtitle: `${quote.reference}${quote.client ? ` · ${quote.client.name}` : ""}`,
        href: `/quotes/${quote.id}`,
        badge: quote.status,
      })),
    ];

    return { query, results: results.slice(0, limit * 2) };
  }
}

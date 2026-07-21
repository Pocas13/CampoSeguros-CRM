import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClaimDto } from "./dto/create-claim.dto";
import { UpdateClaimDto } from "./dto/update-claim.dto";

@Injectable()
export class ClaimsService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId: number) {
    return this.prisma.claim.findMany({
      where: { companyId },
      include: { client: true, policy: { include: { insurer: true } } },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    });
  }

  async findOne(companyId: number, id: number) {
    const claim = await this.prisma.claim.findFirst({
      where: { id, companyId },
      include: { client: true, policy: { include: { insurer: true } } },
    });
    if (!claim) throw new NotFoundException("Sinistro não encontrado.");
    return claim;
  }

  async create(companyId: number, dto: CreateClaimDto) {
    await this.validateLinks(companyId, dto.clientId, dto.policyId);
    try {
      return await this.prisma.claim.create({
        data: {
          companyId,
          clientId: dto.clientId,
          policyId: dto.policyId || null,
          claimNumber: dto.claimNumber.trim(),
          description: dto.description?.trim() || null,
          status: dto.status || "OPEN",
        },
        include: { client: true, policy: { include: { insurer: true } } },
      });
    } catch (error) { this.handle(error); }
  }

  async update(companyId: number, id: number, dto: UpdateClaimDto) {
    const current = await this.findOne(companyId, id);
    const clientId = dto.clientId ?? current.clientId;
    const policyId = dto.policyId === undefined ? current.policyId : dto.policyId;
    await this.validateLinks(companyId, clientId, policyId);
    try {
      return await this.prisma.claim.update({
        where: { id },
        data: {
          clientId: dto.clientId,
          policyId: dto.policyId === undefined ? undefined : dto.policyId,
          claimNumber: dto.claimNumber?.trim(),
          description: dto.description === undefined ? undefined : dto.description?.trim() || null,
          status: dto.status,
        },
        include: { client: true, policy: { include: { insurer: true } } },
      });
    } catch (error) { this.handle(error); }
  }

  async remove(companyId: number, id: number) {
    await this.findOne(companyId, id);
    return this.prisma.claim.delete({ where: { id } });
  }

  private async validateLinks(companyId: number, clientId: number, policyId?: number | null) {
    const client = await this.prisma.client.findFirst({ where: { id: clientId, companyId }, select: { id: true } });
    if (!client) throw new NotFoundException("Cliente não encontrado nesta mediadora.");
    if (policyId) {
      const policy = await this.prisma.policy.findFirst({ where: { id: policyId, companyId, clientId }, select: { id: true } });
      if (!policy) throw new NotFoundException("A apólice não pertence ao cliente ou à mediadora.");
    }
  }

  private handle(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictException("Já existe um sinistro com este número nesta mediadora.");
    }
    throw error;
  }
}

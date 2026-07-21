import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePolicyDto } from "./dto/create-policy.dto";
import { UpdatePolicyDto } from "./dto/update-policy.dto";

@Injectable()
export class PoliciesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(companyId: number) {
    return this.prisma.policy.findMany({
      where: { companyId },
      include: { client: true, insurer: true, quote: true, _count: { select: { documents: true, claims: true } } },
      orderBy: [{ status: "asc" }, { renewalDate: "asc" }],
    });
  }

  async findOne(id: number, companyId: number) {
    const policy = await this.prisma.policy.findUnique({
      where: { id },
      include: {
        client: true,
        insurer: { include: { contacts: { where: { active: true } } } },
        claims: { orderBy: { createdAt: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
        quote: { include: { offers: { include: { insurer: true } } } },
        calendarEvents: { orderBy: { startAt: "asc" } },
      },
    });
    if (!policy || policy.companyId !== companyId) throw new NotFoundException("Apólice não encontrada.");
    return policy;
  }

  async create(dto: CreatePolicyDto, companyId: number) {
    const client = await this.prisma.client.findFirst({ where: { id: dto.clientId, companyId } });
    if (!client) throw new NotFoundException("Cliente não encontrado.");
    return this.prisma.policy
      .create({
        data: {
          ...dto,
          companyId,
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          renewalDate: dto.renewalDate ? new Date(dto.renewalDate) : null,
        },
        include: { client: true, insurer: true },
      })
      .catch((error) => this.handle(error));
  }

  async update(id: number, dto: UpdatePolicyDto, companyId: number) {
    await this.findOne(id, companyId);
    if (dto.clientId !== undefined) {
      const client = await this.prisma.client.findFirst({ where: { id: dto.clientId, companyId } });
      if (!client) throw new NotFoundException("Cliente não encontrado.");
    }
    return this.prisma.policy
      .update({
        where: { id },
        data: {
          ...dto,
          companyId,
          startDate: dto.startDate === undefined ? undefined : dto.startDate ? new Date(dto.startDate) : null,
          renewalDate: dto.renewalDate === undefined ? undefined : dto.renewalDate ? new Date(dto.renewalDate) : null,
        },
        include: { client: true, insurer: true },
      })
      .catch((error) => this.handle(error));
  }

  async addDocument(id: number, dto: { name: string; type?: string; fileName?: string; url?: string; notes?: string }, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.policyDocument.create({
      data: {
        companyId,
        policyId: id,
        name: dto.name.trim(),
        type: dto.type || "OTHER",
        fileName: dto.fileName?.trim() || null,
        url: dto.url?.trim() || null,
        notes: dto.notes?.trim() || null,
      },
    });
  }

  async removeDocument(id: number, companyId: number) {
    const document = await this.prisma.policyDocument.findUnique({ where: { id }, include: { policy: { include: { client: true } } } });
    if (!document || document.companyId !== companyId) throw new NotFoundException("Documento não encontrado.");
    return this.prisma.policyDocument.delete({ where: { id } });
  }

  async remove(id: number, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.policy.delete({ where: { id } }).catch((error) => this.handle(error));
  }

  private handle(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") throw new ConflictException("Já existe uma apólice com este número.");
      if (error.code === "P2003") throw new ConflictException("A apólice possui registos associados e não pode ser eliminada.");
    }
    throw error;
  }
}

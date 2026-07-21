import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationPlanDto } from "./dto/update-organization-plan.dto";

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  listOrganizations() {
    return this.prisma.company.findMany({
      include: {
        _count: { select: { users: true, clients: true, policies: true, quotes: true } },
      },
      orderBy: [{ status: "asc" }, { name: "asc" }],
    });
  }

  async createOrganization(dto: CreateOrganizationDto) {
    const slugBase = dto.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "mediadora";
    try {
      return await this.prisma.$transaction(async (tx) => {
        const organization = await tx.company.create({
          data: {
            name: dto.name.trim(),
            slug: `${slugBase}-${Date.now().toString(36)}`,
            nif: dto.nif || null,
            email: dto.email || null,
            phone: dto.phone || null,
            asfRegistration: dto.asfRegistration || null,
            plan: dto.plan?.trim() || "STARTER",
            status: dto.status || "TRIAL",
            maxUsers: dto.maxUsers || 5,
            maxClients: dto.maxClients || 1000,
          },
        });
        const admin = await tx.user.create({
          data: {
            companyId: organization.id,
            name: dto.adminName.trim(),
            email: dto.adminEmail.toLowerCase().trim(),
            password: await bcrypt.hash(dto.adminPassword, 10),
            role: UserRole.ADMIN,
          },
          select: { id: true, name: true, email: true, role: true },
        });
        return { organization, admin };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Já existe uma organização ou utilizador com estes dados.");
      }
      throw error;
    }
  }

  async updateOrganization(id: number, dto: UpdateOrganizationPlanDto) {
    const exists = await this.prisma.company.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException("Organização não encontrada.");
    return this.prisma.company.update({ where: { id }, data: dto });
  }
}

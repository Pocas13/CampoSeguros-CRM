import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ContactType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInsurerDto } from "./dto/create-insurer.dto";
import { UpdateInsurerDto } from "./dto/update-insurer.dto";

@Injectable()
export class InsurersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: number) {
    const items = await this.prisma.insurer.findMany({
      where: { active: true },
      include: {
        contacts: { where: { active: true }, orderBy: { type: "asc" } },
        organizations: { where: { companyId } },
        _count: { select: { policies: { where: { companyId } } } },
      },
      orderBy: [{ commercialName: "asc" }, { name: "asc" }],
    });
    return items.map((item) => ({ ...item, organizationSettings: item.organizations[0] || null, organizations: undefined }));
  }

  async findOne(id: number, companyId?: number) {
    const item = await this.prisma.insurer.findUnique({
      where: { id },
      include: {
        contacts: { orderBy: { type: "asc" } },
        organizations: companyId ? { where: { companyId } } : false,
        policies: companyId
          ? { where: { companyId }, include: { client: true }, orderBy: { createdAt: "desc" }, take: 20 }
          : false,
        _count: { select: { policies: companyId ? { where: { companyId } } : true } },
      },
    });
    if (!item) throw new NotFoundException("Companhia de seguros não encontrada.");
    const organizations = "organizations" in item && Array.isArray(item.organizations) ? item.organizations : [];
    return { ...item, organizationSettings: organizations[0] || null, organizations: undefined };
  }

  async create(dto: CreateInsurerDto) {
    try {
      return await this.prisma.insurer.create({
        data: {
          ...this.base(dto),
          contacts: dto.contacts?.length ? { create: dto.contacts.map((contact) => ({ ...contact, type: contact.type ?? ContactType.OTHER })) } : undefined,
        },
        include: { contacts: true },
      });
    } catch (error) { this.handle(error); }
  }

  async update(id: number, dto: UpdateInsurerDto) {
    await this.findOne(id);
    try { return await this.prisma.insurer.update({ where: { id }, data: this.base(dto), include: { contacts: true } }); }
    catch (error) { this.handle(error); }
  }

  async addContact(id: number, dto: InsurerContactDto) {
    await this.findOne(id);
    return this.prisma.insurerContact.create({ data: { insurerId: id, ...dto, type: dto.type ?? ContactType.OTHER } });
  }
  removeContact(id: number) { return this.prisma.insurerContact.delete({ where: { id } }); }
  async remove(id: number) { await this.findOne(id); try { return await this.prisma.insurer.delete({ where: { id } }); } catch (error) { this.handle(error); } }

  private base(dto: CreateInsurerDto | UpdateInsurerDto) {
    const clean = (value: unknown) => typeof value === "string" ? value.trim() || null : value;
    return {
      name: dto.name?.trim(), commercialName: clean(dto.commercialName) as string | null | undefined,
      nif: clean(dto.nif) as string | null | undefined, asfCode: clean(dto.asfCode) as string | null | undefined,
      website: clean(dto.website) as string | null | undefined, agentPortalUrl: clean(dto.agentPortalUrl) as string | null | undefined,
      claimsPortalUrl: clean(dto.claimsPortalUrl) as string | null | undefined, quoteLinks: dto.quoteLinks as Prisma.InputJsonValue | undefined,
      email: clean(dto.email) as string | null | undefined, phone: clean(dto.phone) as string | null | undefined,
      address: clean(dto.address) as string | null | undefined, postalCode: clean(dto.postalCode) as string | null | undefined,
      city: clean(dto.city) as string | null | undefined, active: dto.active, notes: clean(dto.notes) as string | null | undefined,
    };
  }

  private handle(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") throw new ConflictException("Já existe uma companhia com estes dados.");
      if (error.code === "P2003") throw new ConflictException("Esta companhia possui registos associados e não pode ser eliminada.");
    }
    throw error;
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PaymentFrequency, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateQuoteDto } from "./dto/create-quote.dto";
import { UpdateQuoteDto } from "./dto/update-quote.dto";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { ConvertQuoteDto } from "./dto/convert-quote.dto";
import { CreateDocumentDto } from "./dto/create-document.dto";

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(companyId: number, status?: string, productType?: string) {
    return this.prisma.quote.findMany({
      where: {
        companyId,
        status: status || undefined,
        productType: productType || undefined,
      },
      include: {
        client: true,
        offers: { include: { insurer: true }, orderBy: { annualPremium: "asc" } },
        policy: true,
        _count: { select: { documents: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findOne(id: number, companyId?: number) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        client: true,
        company: true,
        offers: { include: { insurer: true }, orderBy: [{ selected: "desc" }, { annualPremium: "asc" }] },
        documents: { orderBy: { createdAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" } },
        policy: { include: { insurer: true, client: true } },
      },
    });

    if (!quote || (companyId !== undefined && quote.companyId !== companyId)) throw new NotFoundException("Cotação não encontrada.");
    return quote;
  }

  async create(dto: CreateQuoteDto, companyId: number, createdById: number) {
    if (dto.clientId) {
      const client = await this.prisma.client.findFirst({ where: { id: dto.clientId, companyId } });
      if (!client) throw new NotFoundException("Cliente não encontrado.");
    }
    const reference = await this.nextReference(companyId);
    const insurerIds = [...new Set(dto.insurerIds ?? [])].filter(Boolean);

    if (insurerIds.length) {
      const count = await this.prisma.insurer.count({ where: { id: { in: insurerIds }, active: true } });
      if (count !== insurerIds.length) throw new NotFoundException("Uma ou mais companhias não foram encontradas.");
    }

    const quote = await this.prisma.quote.create({
      data: {
        reference,
        title: dto.title.trim(),
        productType: dto.productType,
        companyId,
        createdById,
        clientId: dto.clientId || null,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        riskData: (dto.riskData ?? undefined) as Prisma.InputJsonValue | undefined,
        preferences: (dto.preferences ?? undefined) as Prisma.InputJsonValue | undefined,
        notes: dto.notes?.trim() || null,
        status: insurerIds.length ? "QUOTING" : "DRAFT",
        offers: insurerIds.length
          ? { create: insurerIds.map((insurerId) => ({ companyId, insurerId, status: "REQUESTED" })) }
          : undefined,
        activities: {
          create: {
            companyId,
            action: "CREATED",
            description: "Cotação criada no InsureFlow.",
          },
        },
      },
      include: { client: true, offers: { include: { insurer: true } } },
    });

    return quote;
  }

  async update(id: number, dto: UpdateQuoteDto, companyId: number) {
    await this.findOne(id, companyId);
    if (dto.clientId) {
      const client = await this.prisma.client.findFirst({ where: { id: dto.clientId, companyId } });
      if (!client) throw new NotFoundException("Cliente não encontrado.");
    }
    return this.prisma.quote.update({
      where: { id },
      data: {
        title: dto.title?.trim(),
        productType: dto.productType,
        clientId: dto.clientId === undefined ? undefined : dto.clientId || null,
        effectiveDate: dto.effectiveDate === undefined ? undefined : dto.effectiveDate ? new Date(dto.effectiveDate) : null,
        expiresAt: dto.expiresAt === undefined ? undefined : dto.expiresAt ? new Date(dto.expiresAt) : null,
        riskData: dto.riskData === undefined ? undefined : (dto.riskData as Prisma.InputJsonValue),
        preferences: dto.preferences === undefined ? undefined : (dto.preferences as Prisma.InputJsonValue),
        notes: dto.notes === undefined ? undefined : dto.notes?.trim() || null,
      },
    });
  }

  async addOffer(quoteId: number, dto: CreateOfferDto, companyId: number) {
    await this.findOne(quoteId, companyId);
    const existing = await this.prisma.quoteOffer.findFirst({ where: { companyId, quoteId, insurerId: dto.insurerId } });
    if (existing) {
      return this.updateOffer(existing.id, dto, companyId);
    }

    const offer = await this.prisma.quoteOffer.create({
      data: this.offerData(companyId, quoteId, dto),
      include: { insurer: true },
    });
    await this.log(companyId, quoteId, "OFFER_ADDED", `Proposta adicionada: ${offer.insurer.commercialName || offer.insurer.name}.`);
    await this.refreshQuoteStatus(quoteId);
    return offer;
  }

  async updateOffer(id: number, dto: UpdateOfferDto, companyId: number) {
    const existing = await this.prisma.quoteOffer.findUnique({ where: { id }, include: { quote: true } });
    if (!existing || existing.quote.companyId !== companyId) throw new NotFoundException("Proposta não encontrada.");
    const offer = await this.prisma.quoteOffer.update({
      where: { id },
      data: {
        insurerId: dto.insurerId,
        quoteNumber: dto.quoteNumber === undefined ? undefined : dto.quoteNumber?.trim() || null,
        annualPremium: dto.annualPremium,
        installmentPremium: dto.installmentPremium,
        commission: dto.commission,
        deductible: dto.deductible,
        status: dto.status,
        validUntil: dto.validUntil === undefined ? undefined : dto.validUntil ? new Date(dto.validUntil) : null,
        coverages: dto.coverages === undefined ? undefined : (dto.coverages as Prisma.InputJsonValue),
        exclusions: dto.exclusions === undefined ? undefined : (dto.exclusions as Prisma.InputJsonValue),
        notes: dto.notes === undefined ? undefined : dto.notes?.trim() || null,
        recommended: dto.recommended,
      },
      include: { insurer: true },
    });
    await this.log(companyId, existing.quoteId, "OFFER_UPDATED", `Proposta atualizada: ${offer.insurer.commercialName || offer.insurer.name}.`);
    await this.refreshQuoteStatus(existing.quoteId);
    return offer;
  }

  async selectOffer(quoteId: number, offerId: number, companyId: number) {
    await this.findOne(quoteId, companyId);
    const offer = await this.prisma.quoteOffer.findFirst({ where: { id: offerId, quoteId, companyId }, include: { insurer: true } });
    if (!offer) throw new NotFoundException("Proposta não encontrada nesta cotação.");

    await this.prisma.$transaction([
      this.prisma.quoteOffer.updateMany({ where: { quoteId, companyId }, data: { selected: false } }),
      this.prisma.quoteOffer.update({ where: { id: offerId }, data: { selected: true, status: "ACCEPTED" } }),
      this.prisma.quote.update({ where: { id: quoteId }, data: { status: "SELECTED" } }),
    ]);
    await this.log(companyId, quoteId, "OFFER_SELECTED", `Proposta escolhida: ${offer.insurer.commercialName || offer.insurer.name}.`);
    return this.findOne(quoteId, companyId);
  }

  async addDocument(quoteId: number, dto: CreateDocumentDto, companyId: number) {
    await this.findOne(quoteId, companyId);
    const document = await this.prisma.quoteDocument.create({
      data: {
        companyId,
        quoteId,
        name: dto.name.trim(),
        type: dto.type || "OTHER",
        fileName: dto.fileName?.trim() || null,
        url: dto.url?.trim() || null,
        notes: dto.notes?.trim() || null,
      },
    });
    await this.log(companyId, quoteId, "DOCUMENT_ADDED", `Documento adicionado: ${document.name}.`);
    return document;
  }

  async removeDocument(id: number, companyId: number) {
    const document = await this.prisma.quoteDocument.findUnique({ where: { id }, include: { quote: true } });
    if (!document || document.quote.companyId !== companyId) throw new NotFoundException("Documento não encontrado.");
    return this.prisma.quoteDocument.delete({ where: { id } });
  }

  async convertToPolicy(id: number, dto: ConvertQuoteDto, companyId: number, currentUserId: number) {
    const quote = await this.findOne(id, companyId);
    if (quote.policy) return quote.policy;
    if (!quote.clientId) throw new BadRequestException("Associe um cliente antes de converter a cotação.");

    const selected = quote.offers.find((offer) => offer.selected) ?? quote.offers.find((offer) => offer.status === "RECEIVED");
    if (!selected) throw new BadRequestException("Selecione uma proposta antes de criar a apólice.");

    try {
      const policy = await this.prisma.policy.create({
        data: {
          companyId,
          policyNumber: dto.policyNumber.trim(),
          proposalNumber: dto.proposalNumber?.trim() || selected.quoteNumber || null,
          product: quote.title,
          branch: this.productLabel(quote.productType),
          premium: selected.annualPremium,
          commission: selected.commission,
          startDate: dto.startDate ? new Date(dto.startDate) : quote.effectiveDate,
          renewalDate: dto.renewalDate ? new Date(dto.renewalDate) : null,
          paymentFrequency: dto.paymentFrequency ?? PaymentFrequency.ANNUAL,
          status: "ACTIVE",
          notes: dto.notes?.trim() || quote.notes,
          clientId: quote.clientId,
          insurerId: selected.insurerId,
          quoteId: quote.id,
        },
        include: { client: true, insurer: true, quote: true },
      });

      await this.prisma.quote.update({ where: { id }, data: { status: "CONVERTED" } });
      await this.log(companyId, id, "CONVERTED", `Cotação convertida na apólice ${policy.policyNumber}.`);

      if (policy.renewalDate) {
        await this.prisma.calendarEvent.create({
          data: {
            title: `Renovação ${policy.policyNumber}`,
            description: `${policy.client.name} · ${policy.product}`,
            type: "RENEWAL",
            priority: "HIGH",
            startAt: policy.renewalDate,
            allDay: true,
            companyId: quote.companyId,
            createdById: currentUserId,
            assignedToId: currentUserId,
            clientId: policy.clientId,
            policyId: policy.id,
            quoteId: quote.id,
            reminders: [30, 15, 7] as Prisma.InputJsonValue,
          },
        });
      }

      return policy;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Já existe uma apólice com este número.");
      }
      throw error;
    }
  }

  async remove(id: number, companyId: number) {
    const quote = await this.findOne(id, companyId);
    if (quote.policy) throw new ConflictException("Esta cotação já foi convertida em apólice e não pode ser eliminada.");
    return this.prisma.quote.delete({ where: { id } });
  }

  private offerData(companyId: number, quoteId: number, dto: CreateOfferDto): Prisma.QuoteOfferUncheckedCreateInput {
    return {
      companyId,
      quoteId,
      insurerId: dto.insurerId,
      quoteNumber: dto.quoteNumber?.trim() || null,
      annualPremium: dto.annualPremium,
      installmentPremium: dto.installmentPremium,
      commission: dto.commission,
      deductible: dto.deductible,
      status: dto.status || (dto.annualPremium != null ? "RECEIVED" : "REQUESTED"),
      validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      coverages: (dto.coverages ?? undefined) as Prisma.InputJsonValue | undefined,
      exclusions: (dto.exclusions ?? undefined) as Prisma.InputJsonValue | undefined,
      notes: dto.notes?.trim() || null,
      recommended: dto.recommended ?? false,
    };
  }

  private async nextReference(companyId: number) {
    const year = new Date().getFullYear();
    const count = await this.prisma.quote.count({ where: { companyId, createdAt: { gte: new Date(`${year}-01-01T00:00:00.000Z`) } } });
    return `COT-${year}-${String(count + 1).padStart(5, "0")}`;
  }

  private log(companyId: number, quoteId: number, action: string, description: string) {
    return this.prisma.quoteActivity.create({ data: { companyId, quoteId, action, description } });
  }

  private async refreshQuoteStatus(quoteId: number) {
    const received = await this.prisma.quoteOffer.count({ where: { quoteId, annualPremium: { not: null } } });
    if (received > 0) await this.prisma.quote.update({ where: { id: quoteId }, data: { status: "COMPARING" } });
  }

  private productLabel(productType: string) {
    const labels: Record<string, string> = {
      AUTO: "Automóvel",
      MOTORCYCLE: "Moto",
      HOME: "Habitação",
      LIFE: "Vida",
      HEALTH: "Saúde",
      WORK_ACCIDENT: "Acidentes de Trabalho",
      BUSINESS: "Empresas",
      TRAVEL: "Viagem",
      PERSONAL_ACCIDENT: "Acidentes Pessoais",
    };
    return labels[productType] || productType;
  }
}

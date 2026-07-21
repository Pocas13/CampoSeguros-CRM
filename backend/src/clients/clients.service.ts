import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(data: CreateClientDto, companyId: number) {
    const name = data.name.trim();

    if (!name) {
      throw new BadRequestException(
        "O nome do cliente é obrigatório.",
      );
    }

    const [organization, clientCount] = await Promise.all([
      this.prisma.company.findUnique({ where: { id: companyId }, select: { maxClients: true } }),
      this.prisma.client.count({ where: { companyId } }),
    ]);
    if (!organization) throw new NotFoundException("Organização não encontrada.");
    if (clientCount >= organization.maxClients) throw new ConflictException("Foi atingido o limite de clientes do plano.");

    try {
      return await this.prisma.client.create({
        data: {
          name,
          type: data.type,
          nif: this.cleanNullable(data.nif),
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          incorporationDate: data.incorporationDate ? new Date(data.incorporationDate) : null,
          cae: this.cleanNullable(data.cae),
          representativeName: this.cleanNullable(data.representativeName),
          email: this.cleanNullable(data.email),
          phone: this.cleanNullable(data.phone),
          address: this.cleanNullable(data.address),
          postalCode: this.cleanNullable(
            data.postalCode,
          ),
          city: this.cleanNullable(data.city),
          country: this.cleanNullable(data.country) ?? "Portugal",
          notes: this.cleanNullable(data.notes),
          companyId,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll(companyId: number) {
    return this.prisma.client.findMany({
      where: { companyId },
      orderBy: [
        {
          active: "desc",
        },
        {
          name: "asc",
        },
      ],
    });
  }

  async findOne(id: number, companyId: number) {
    const client =
      await this.prisma.client.findFirst({
        where: { id, companyId },
        include: {
          policies: {
            include: { insurer: true },
            orderBy: {
              createdAt: "desc",
            },
          },
          claims: {
            orderBy: {
              createdAt: "desc",
            },
          },
          simulations: {
            orderBy: {
              createdAt: "desc",
            },
          },
          quotes: {
            include: { offers: { include: { insurer: true } }, policy: true },
            orderBy: { updatedAt: "desc" },
          },
        },
      });

    if (!client) {
      throw new NotFoundException(
        "Cliente não encontrado.",
      );
    }

    return client;
  }

  async update(
    id: number,
    data: UpdateClientDto,
    companyId: number,
  ) {
    await this.findOne(id, companyId);

    const updateData: Prisma.ClientUpdateInput =
      {};

    if (data.name !== undefined) {
      const name = data.name.trim();

      if (!name) {
        throw new BadRequestException(
          "O nome do cliente é obrigatório.",
        );
      }

      updateData.name = name;
    }

    if (data.type !== undefined) updateData.type = data.type;
    if (data.incorporationDate !== undefined) updateData.incorporationDate = data.incorporationDate ? new Date(data.incorporationDate) : null;
    if (data.cae !== undefined) updateData.cae = this.cleanNullable(data.cae);
    if (data.representativeName !== undefined) updateData.representativeName = this.cleanNullable(data.representativeName);
    if (data.country !== undefined) updateData.country = this.cleanNullable(data.country);

    if (data.nif !== undefined) {
      updateData.nif = this.cleanNullable(data.nif);
    }

    if (data.birthDate !== undefined) {
      updateData.birthDate = data.birthDate
        ? new Date(data.birthDate)
        : null;
    }

    if (data.email !== undefined) {
      updateData.email = this.cleanNullable(
        data.email,
      );
    }

    if (data.phone !== undefined) {
      updateData.phone = this.cleanNullable(
        data.phone,
      );
    }

    if (data.address !== undefined) {
      updateData.address = this.cleanNullable(
        data.address,
      );
    }

    if (data.postalCode !== undefined) {
      updateData.postalCode =
        this.cleanNullable(data.postalCode);
    }

    if (data.city !== undefined) {
      updateData.city = this.cleanNullable(
        data.city,
      );
    }

    if (data.notes !== undefined) {
      updateData.notes = this.cleanNullable(
        data.notes,
      );
    }

    if (data.active !== undefined) {
      updateData.active = data.active;
    }

    try {
      return await this.prisma.client.update({
        where: {
          id,
        },
        data: updateData,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number, companyId: number) {
    await this.findOne(id, companyId);

    try {
      return await this.prisma.client.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private cleanNullable(
    value: string | null | undefined,
  ): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const cleaned = value.trim();

    return cleaned || null;
  }

  private handlePrismaError(
    error: unknown,
  ): never {
    if (
      error instanceof
      Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2002") {
        throw new ConflictException(
          "Já existe um cliente com este NIF.",
        );
      }

      if (error.code === "P2025") {
        throw new NotFoundException(
          "Cliente não encontrado.",
        );
      }

      if (error.code === "P2003") {
        throw new ConflictException(
          "Este cliente possui apólices, sinistros ou outros registos associados e não pode ser eliminado.",
        );
      }
    }

    throw error;
  }
}
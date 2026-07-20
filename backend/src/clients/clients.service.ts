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

  async create(data: CreateClientDto) {
    const name = data.name.trim();

    if (!name) {
      throw new BadRequestException(
        "O nome do cliente é obrigatório.",
      );
    }

    try {
      return await this.prisma.client.create({
        data: {
          name,
          nif: this.cleanNullable(data.nif),
          birthDate: data.birthDate
            ? new Date(data.birthDate)
            : null,
          email: this.cleanNullable(data.email),
          phone: this.cleanNullable(data.phone),
          address: this.cleanNullable(data.address),
          postalCode: this.cleanNullable(
            data.postalCode,
          ),
          city: this.cleanNullable(data.city),
          notes: this.cleanNullable(data.notes),
          companyId: data.companyId,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll() {
    return this.prisma.client.findMany({
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

  async findOne(id: number) {
    const client =
      await this.prisma.client.findUnique({
        where: {
          id,
        },
        include: {
          policies: {
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
  ) {
    await this.findOne(id);

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

  async remove(id: number) {
    await this.findOne(id);

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
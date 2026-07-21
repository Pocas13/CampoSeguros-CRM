import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(data: CreateCompanyDto) {
    const name = data.name?.trim();

    if (!name || name.length < 2) {
      throw new BadRequestException(
        "O nome da empresa é obrigatório.",
      );
    }

    const nif = this.cleanNullable(data.nif);
    this.validateNif(nif);

    try {
      return await this.prisma.company.create({
        data: {
          name,
          nif,
          email: this.cleanNullable(data.email),
          phone: this.cleanNullable(data.phone),
          address: this.cleanNullable(data.address),
          postalCode: this.cleanNullable(data.postalCode),
          city: this.cleanNullable(data.city),
          website: this.cleanNullable(data.website),
          logoUrl: this.cleanNullable(data.logoUrl),
          asfRegistration: this.cleanNullable(data.asfRegistration),
        },
        include: {
          _count: {
            select: {
              users: true,
              clients: true,
              simulations: true,
            },
          },
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  findAll() {
    return this.prisma.company.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            users: true,
            clients: true,
            simulations: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const company =
      await this.prisma.company.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              users: true,
              clients: true,
              simulations: true,
            },
          },
          users: {
            orderBy: {
              name: "asc",
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              active: true,
              createdAt: true,
            },
          },
          clients: {
            orderBy: {
              updatedAt: "desc",
            },
            take: 10,
            select: {
              id: true,
              name: true,
              nif: true,
              email: true,
              phone: true,
              city: true,
              active: true,
              updatedAt: true,
            },
          },
          simulations: {
            orderBy: {
              updatedAt: "desc",
            },
            take: 5,
            select: {
              id: true,
              insuranceType: true,
              premium: true,
              status: true,
              updatedAt: true,
            },
          },
        },
      });

    if (!company) {
      throw new NotFoundException(
        "Empresa não encontrada.",
      );
    }

    return company;
  }

  async update(
    id: number,
    data: UpdateCompanyDto,
  ) {
    await this.ensureExists(id);

    const updateData: Prisma.CompanyUpdateInput = {};

    if (data.name !== undefined) {
      const name = data.name.trim();

      if (name.length < 2) {
        throw new BadRequestException(
          "O nome da empresa é obrigatório.",
        );
      }

      updateData.name = name;
    }

    if (data.nif !== undefined) {
      const nif = this.cleanNullable(data.nif);
      this.validateNif(nif);
      updateData.nif = nif;
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

    if (data.city !== undefined) updateData.city = this.cleanNullable(data.city);
    if (data.postalCode !== undefined) updateData.postalCode = this.cleanNullable(data.postalCode);
    if (data.website !== undefined) updateData.website = this.cleanNullable(data.website);
    if (data.logoUrl !== undefined) updateData.logoUrl = this.cleanNullable(data.logoUrl);
    if (data.asfRegistration !== undefined) updateData.asfRegistration = this.cleanNullable(data.asfRegistration);

    try {
      return await this.prisma.company.update({
        where: {
          id,
        },
        data: updateData,
        include: {
          _count: {
            select: {
              users: true,
              clients: true,
              simulations: true,
            },
          },
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number) {
    const company = await this.findOne(id);

    const associatedRecords =
      company._count.users +
      company._count.clients +
      company._count.simulations;

    if (associatedRecords > 0) {
      throw new ConflictException(
        "A empresa possui utilizadores, clientes ou simulações associados e não pode ser eliminada.",
      );
    }

    try {
      return await this.prisma.company.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async ensureExists(id: number) {
    const company =
      await this.prisma.company.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

    if (!company) {
      throw new NotFoundException(
        "Empresa não encontrada.",
      );
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

  private validateNif(nif: string | null) {
    if (nif && !/^\d{9}$/.test(nif)) {
      throw new BadRequestException(
        "O NIF deve conter exatamente 9 números.",
      );
    }
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
          "Já existe uma empresa com este NIF.",
        );
      }

      if (error.code === "P2025") {
        throw new NotFoundException(
          "Empresa não encontrada.",
        );
      }

      if (error.code === "P2003") {
        throw new ConflictException(
          "A empresa possui registos associados e não pode ser eliminada.",
        );
      }
    }

    throw error;
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

create(data: CreateClientDto) {
  return this.prisma.client.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      nif: data.nif,
      birthDate: data.birthDate,
      address: data.address,
      postalCode: data.postalCode,
      city: data.city,
      notes: data.notes,
      company: {
        connect: {
          id: data.companyId,
        },
      },
    },
  });
}

  findAll() {
    return this.prisma.client.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  findOne(id: number) {
    return this.prisma.client.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: number, data: UpdateClientDto) {
    return this.prisma.client.update({
      where: {
        id,
      },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.client.delete({
      where: {
        id,
      },
    });
  }
}
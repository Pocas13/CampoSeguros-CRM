import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSimulationDto } from "./dto/create-simulation.dto";
import { UpdateSimulationDto } from "./dto/update-simulation.dto";

@Injectable()
export class SimulationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSimulationDto) {
    return this.prisma.simulation.create({
      data,
    });
  }

  findAll() {
    return this.prisma.simulation.findMany({
      include: {
        client: true,
        company: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findOne(id: number) {
    return this.prisma.simulation.findUnique({
      where: {
        id,
      },
      include: {
        client: true,
        company: true,
      },
    });
  }

  update(id: number, data: UpdateSimulationDto) {
    return this.prisma.simulation.update({
      where: {
        id,
      },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.simulation.delete({
      where: {
        id,
      },
    });
  }
}
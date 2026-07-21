import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSimulationDto } from "./dto/create-simulation.dto";
import { UpdateSimulationDto } from "./dto/update-simulation.dto";

@Injectable()
export class SimulationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSimulationDto, companyId: number) {
    const client = await this.prisma.client.findFirst({ where: { id: data.clientId, companyId } });
    if (!client) throw new NotFoundException("Cliente não encontrado.");
    return this.prisma.simulation.create({ data: { ...data, companyId } });
  }

  findAll(companyId: number) {
    return this.prisma.simulation.findMany({ where: { companyId }, include: { client: true }, orderBy: { createdAt: "desc" } });
  }

  async findOne(id: number, companyId: number) {
    const item = await this.prisma.simulation.findFirst({ where: { id, companyId }, include: { client: true } });
    if (!item) throw new NotFoundException("Simulação não encontrada.");
    return item;
  }

  async update(id: number, data: UpdateSimulationDto, companyId: number) {
    await this.findOne(id, companyId);
    if (data.clientId) {
      const client = await this.prisma.client.findFirst({ where: { id: data.clientId, companyId } });
      if (!client) throw new NotFoundException("Cliente não encontrado.");
    }
    return this.prisma.simulation.update({ where: { id }, data });
  }

  async remove(id: number, companyId: number) {
    await this.findOne(id, companyId);
    return this.prisma.simulation.delete({ where: { id } });
  }
}

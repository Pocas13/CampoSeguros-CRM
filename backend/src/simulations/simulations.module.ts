import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";

import { SimulationsController } from "./simulations.controller";
import { SimulationsService } from "./simulations.service";

@Module({
  imports: [PrismaModule],
  controllers: [SimulationsController],
  providers: [SimulationsService],
})
export class SimulationsModule {}
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import { SimulationsService } from "./simulations.service";
import { CreateSimulationDto } from "./dto/create-simulation.dto";
import { UpdateSimulationDto } from "./dto/update-simulation.dto";

@Controller("simulations")
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Post()
  create(@Body() dto: CreateSimulationDto) {
    return this.simulationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.simulationsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.simulationsService.findOne(Number(id));
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateSimulationDto,
  ) {
    return this.simulationsService.update(Number(id), dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.simulationsService.remove(Number(id));
  }
}
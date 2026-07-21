import { Body, Controller, Get, Post } from "@nestjs/common";
import { LookupVehicleDto } from "./dto/lookup-vehicle.dto";
import { VehicleLookupService } from "./vehicle-lookup.service";

@Controller("vehicle-lookup")
export class VehicleLookupController {
  constructor(private readonly vehicleLookupService: VehicleLookupService) {}

  @Post("registration")
  lookupByRegistration(@Body() dto: LookupVehicleDto) {
    return this.vehicleLookupService.lookup(dto);
  }

  @Get("status")
  status() {
    return this.vehicleLookupService.status();
  }
}

import { Module } from "@nestjs/common";
import { VehicleLookupController } from "./vehicle-lookup.controller";
import { VehicleLookupService } from "./vehicle-lookup.service";

@Module({
  controllers: [VehicleLookupController],
  providers: [VehicleLookupService],
  exports: [VehicleLookupService],
})
export class VehicleLookupModule {}

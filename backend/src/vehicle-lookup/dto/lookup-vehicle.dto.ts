import { IsDateString, IsIn, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class LookupVehicleDto {
  @IsString()
  @MaxLength(12)
  @Matches(/^[A-Za-z0-9\s-]{6,12}$/, {
    message: "A matrícula não é válida.",
  })
  registrationNumber: string;

  @IsOptional()
  @IsDateString({}, { message: "A data da primeira matrícula não é válida." })
  firstRegistrationDate?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/i, {
    message: "O VIN deve ter 17 caracteres válidos.",
  })
  vin?: string | null;

  @IsOptional()
  @IsIn(["AUTO", "MOTORCYCLE"])
  vehicleType?: "AUTO" | "MOTORCYCLE";
}

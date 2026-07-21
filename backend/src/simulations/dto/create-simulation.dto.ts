import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
export class CreateSimulationDto {
  @IsInt() @Min(1) clientId: number;
  @IsString() insuranceType: string;
  @IsOptional() @IsNumber() premium?: number;
  @IsOptional() @IsNumber() commission?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() status?: string;
}

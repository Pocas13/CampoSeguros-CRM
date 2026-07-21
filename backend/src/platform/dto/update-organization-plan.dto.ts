import { OrganizationStatus } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateOrganizationPlanDto {
  @IsOptional() @IsEnum(OrganizationStatus) status?: OrganizationStatus;
  @IsOptional() @IsString() plan?: string;
  @IsOptional() @IsInt() @Min(1) @Max(1000) maxUsers?: number;
  @IsOptional() @IsInt() @Min(1) @Max(1000000) maxClients?: number;
}

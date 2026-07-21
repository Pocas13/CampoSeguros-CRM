import { IntegrationEnvironment, IntegrationMode, IntegrationStatus } from "@prisma/client";
import { IsEnum, IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export class SaveIntegrationDto {
  @IsEnum(IntegrationMode)
  mode: IntegrationMode;

  @IsEnum(IntegrationEnvironment)
  environment: IntegrationEnvironment;

  @IsOptional()
  @IsEnum(IntegrationStatus)
  status?: IntegrationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  agencyCode?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  username?: string | null;

  @IsOptional()
  @IsString()
  secret?: string | null;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  capabilities?: Record<string, unknown>;
}

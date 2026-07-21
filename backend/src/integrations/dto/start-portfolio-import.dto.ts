import { ImportSource, IntegrationEnvironment } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class StartPortfolioImportDto {
  @IsEnum(ImportSource)
  source: ImportSource;

  @IsOptional()
  @IsEnum(IntegrationEnvironment)
  environment?: IntegrationEnvironment;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;
}

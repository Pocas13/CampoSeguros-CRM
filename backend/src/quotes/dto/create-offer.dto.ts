import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateOfferDto {
  @IsInt()
  @Min(1)
  insurerId: number;

  @IsOptional()
  @IsString()
  quoteNumber?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualPremium?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  installmentPremium?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commission?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deductible?: number | null;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string | null;

  @IsOptional()
  @IsObject()
  coverages?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject()
  exclusions?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsBoolean()
  recommended?: boolean;
}

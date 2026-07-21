import {
  IsArray,
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateQuoteDto {
  @IsString()
  title: string;

  @IsString()
  productType: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  clientId?: number | null;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string | null;

  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @IsOptional()
  @IsObject()
  riskData?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject()
  preferences?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsArray()
  insurerIds?: number[];
}

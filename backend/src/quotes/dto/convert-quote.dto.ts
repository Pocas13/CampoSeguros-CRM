import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { PaymentFrequency } from "@prisma/client";

export class ConvertQuoteDto {
  @IsString()
  policyNumber: string;

  @IsOptional()
  @IsString()
  proposalNumber?: string | null;

  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @IsOptional()
  @IsDateString()
  renewalDate?: string | null;

  @IsOptional()
  @IsEnum(PaymentFrequency)
  paymentFrequency?: PaymentFrequency;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

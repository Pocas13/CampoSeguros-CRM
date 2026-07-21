import { ClaimStatus } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class UpdateClaimDto {
  @IsOptional() @IsString() @MaxLength(120) claimNumber?: string;
  @IsOptional() @IsInt() @Min(1) clientId?: number;
  @IsOptional() @IsInt() @Min(1) policyId?: number | null;
  @IsOptional() @IsString() @MaxLength(5000) description?: string | null;
  @IsOptional() @IsEnum(ClaimStatus) status?: ClaimStatus;
}

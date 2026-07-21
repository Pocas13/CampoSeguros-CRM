import { IsBoolean, IsEmail, IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateOrganizationInsurerDto {
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsString() @MaxLength(120) agencyCode?: string | null;
  @IsOptional() @IsString() @MaxLength(150) accountManagerName?: string | null;
  @IsOptional() @IsEmail() accountManagerEmail?: string | null;
  @IsOptional() @IsString() @MaxLength(50) accountManagerPhone?: string | null;
  @IsOptional() @IsString() @MaxLength(50) agentSupportPhone?: string | null;
  @IsOptional() @IsEmail() agentSupportEmail?: string | null;
  @IsOptional() @IsString() @MaxLength(50) claimsPhone?: string | null;
  @IsOptional() @IsEmail() claimsEmail?: string | null;
  @IsOptional() @IsString() @MaxLength(50) assistancePhone?: string | null;
  @IsOptional() @IsObject() customQuoteLinks?: Record<string, string> | null;
  @IsOptional() @IsString() @MaxLength(5000) notes?: string | null;
}

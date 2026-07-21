import { OrganizationStatus } from "@prisma/client";
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateOrganizationDto {
  @IsString() @MinLength(2) @MaxLength(150) name: string;
  @IsOptional() @Matches(/^\d{9}$/) nif?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() asfRegistration?: string;
  @IsOptional() @IsString() plan?: string;
  @IsOptional() @IsEnum(OrganizationStatus) status?: OrganizationStatus;
  @IsOptional() @IsInt() @Min(1) @Max(1000) maxUsers?: number;
  @IsOptional() @IsInt() @Min(1) @Max(1000000) maxClients?: number;

  @IsString() @MinLength(2) adminName: string;
  @IsEmail() adminEmail: string;
  @IsString() @MinLength(8) adminPassword: string;
}

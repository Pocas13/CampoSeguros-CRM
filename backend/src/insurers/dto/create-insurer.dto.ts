import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { ContactType } from "@prisma/client";

export class InsurerContactDto {
  @IsOptional() @IsEnum(ContactType) type?: ContactType;
  @IsOptional() @IsString() name?: string | null;
  @IsOptional() @IsString() department?: string | null;
  @IsOptional() @IsEmail() email?: string | null;
  @IsOptional() @IsString() phone?: string | null;
  @IsOptional() @IsString() mobile?: string | null;
  @IsOptional() @IsString() schedule?: string | null;
  @IsOptional() @IsString() notes?: string | null;
  @IsOptional() @IsBoolean() active?: boolean;
}

export class CreateInsurerDto {
  @IsString() @MaxLength(200) name: string;
  @IsOptional() @IsString() commercialName?: string | null;
  @IsOptional() @IsString() nif?: string | null;
  @IsOptional() @IsString() asfCode?: string | null;
  @IsOptional() @IsUrl() website?: string | null;
  @IsOptional() @IsUrl() agentPortalUrl?: string | null;
  @IsOptional() @IsUrl() claimsPortalUrl?: string | null;
  @IsOptional() @IsObject() quoteLinks?: Record<string, string> | null;
  @IsOptional() @IsEmail() email?: string | null;
  @IsOptional() @IsString() phone?: string | null;
  @IsOptional() @IsString() address?: string | null;
  @IsOptional() @IsString() postalCode?: string | null;
  @IsOptional() @IsString() city?: string | null;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsString() notes?: string | null;
  @IsOptional() @ValidateNested({ each: true }) @Type(() => InsurerContactDto) contacts?: InsurerContactDto[];
}

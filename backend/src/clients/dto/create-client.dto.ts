import { ClientType } from "@prisma/client";
import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateClientDto {
  @IsString() @IsNotEmpty() @MinLength(2) @MaxLength(150) name: string;
  @IsOptional() @IsEnum(ClientType) type?: ClientType;
  @IsOptional() @Matches(/^\d{9}$/, { message: "O NIF deve conter exatamente 9 números." }) nif?: string | null;
  @IsOptional() @IsDateString() birthDate?: string | null;
  @IsOptional() @IsDateString() incorporationDate?: string | null;
  @IsOptional() @IsString() cae?: string | null;
  @IsOptional() @IsString() representativeName?: string | null;
  @IsOptional() @IsEmail() email?: string | null;
  @IsOptional() @IsString() phone?: string | null;
  @IsOptional() @IsString() address?: string | null;
  @IsOptional() @IsString() postalCode?: string | null;
  @IsOptional() @IsString() city?: string | null;
  @IsOptional() @IsString() country?: string | null;
  @IsOptional() @IsString() notes?: string | null;
}

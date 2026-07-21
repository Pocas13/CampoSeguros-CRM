import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from "class-validator";

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @IsOptional()
  @Matches(/^\d{9}$/, { message: "O NIF deve conter exatamente 9 números." })
  nif?: string | null;

  @IsOptional()
  @IsEmail({}, { message: "O email não é válido." })
  email?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string | null;

  @IsOptional()
  @IsUrl({}, { message: "O website não é válido." })
  website?: string | null;

  @IsOptional()
  @IsUrl({}, { message: "O endereço do logótipo não é válido." })
  logoUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  asfRegistration?: string | null;
}

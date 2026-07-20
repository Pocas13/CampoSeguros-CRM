import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @Matches(/^\d{9}$/, {
    message: "O NIF deve conter exatamente 9 números.",
  })
  nif?: string | null;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: "A data de nascimento não é válida.",
    },
  )
  birthDate?: string | null;

  @IsOptional()
  @IsEmail(
    {},
    {
      message: "O email não é válido.",
    },
  )
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
  @IsString()
  @MaxLength(5000)
  notes?: string | null;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
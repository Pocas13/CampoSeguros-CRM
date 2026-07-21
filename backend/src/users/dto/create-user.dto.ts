import { UserRole } from "@prisma/client";
import { IsArray, IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

const imageReferencePattern = /^(https?:\/\/|data:image\/(png|jpeg|jpg|webp);base64,)/i;

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsEmail({}, { message: "O email não é válido." })
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500_000)
  @Matches(imageReferencePattern, {
    message: "A fotografia deve ser uma imagem carregada ou um endereço HTTPS válido.",
  })
  avatarUrl?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

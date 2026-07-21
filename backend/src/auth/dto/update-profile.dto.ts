import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

const imageReferencePattern = /^(https?:\/\/|data:image\/(png|jpeg|jpg|webp);base64,)/i;

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

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
}

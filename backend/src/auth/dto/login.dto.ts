import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Introduza um endereço de email válido." })
  @MaxLength(200)
  email: string;

  @IsString()
  @MinLength(6, { message: "A palavra-passe deve ter pelo menos 6 caracteres." })
  @MaxLength(200)
  password: string;
}

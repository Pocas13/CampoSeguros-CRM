import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: "O nome é obrigatório." })
  @MaxLength(150)
  name: string;

  @IsEmail({}, { message: "Introduza um endereço de email válido." })
  @MaxLength(200)
  email: string;

  @IsString()
  @MinLength(8, { message: "A palavra-passe deve ter pelo menos 8 caracteres." })
  @MaxLength(200)
  password: string;
}

import { UserRole } from "@prisma/client";
import { IsArray, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

export class InviteUserDto {
  @IsEmail() email: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional() @IsArray() @IsString({ each: true }) permissions?: string[];
}

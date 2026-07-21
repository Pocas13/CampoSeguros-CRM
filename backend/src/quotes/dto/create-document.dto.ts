import { IsOptional, IsString } from "class-validator";

export class CreateDocumentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  fileName?: string | null;

  @IsOptional()
  @IsString()
  url?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

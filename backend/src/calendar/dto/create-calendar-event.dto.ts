import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateCalendarEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsDateString()
  startAt: string;

  @IsOptional()
  @IsDateString()
  endAt?: string | null;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsString()
  color?: string | null;

  @IsOptional()
  @IsArray()
  reminders?: number[];

  @IsOptional()
  @IsInt()
  clientId?: number | null;

  @IsOptional()
  @IsInt()
  policyId?: number | null;

  @IsOptional()
  @IsInt()
  quoteId?: number | null;

  @IsOptional()
  @IsInt()
  assignedToId?: number | null;
}

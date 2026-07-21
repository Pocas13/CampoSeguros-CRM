import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { PaymentFrequency, PolicyStatus } from "@prisma/client";
export class CreatePolicyDto {
 @IsString() policyNumber:string; @IsOptional() @IsString() proposalNumber?:string|null; @IsString() product:string; @IsOptional() @IsString() branch?:string|null;
 @IsOptional() @IsNumber() @Min(0) premium?:number|null; @IsOptional() @IsNumber() @Min(0) commission?:number|null;
 @IsOptional() @IsDateString() startDate?:string|null; @IsOptional() @IsDateString() renewalDate?:string|null;
 @IsOptional() @IsEnum(PaymentFrequency) paymentFrequency?:PaymentFrequency; @IsOptional() @IsEnum(PolicyStatus) status?:PolicyStatus;
 @IsOptional() @IsString() notes?:string|null; @IsInt() clientId:number; @IsOptional() @IsInt() insurerId?:number|null;
}

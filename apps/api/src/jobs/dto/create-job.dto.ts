import {
  IsString, IsNumber, IsOptional, IsUUID, IsDateString, Min,
} from 'class-validator';

export class CreateJobDto {
  @IsUUID()
  organization_id: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  location_lat?: number;

  @IsNumber()
  @IsOptional()
  location_lng?: number;

  @IsString()
  @IsOptional()
  location_address?: string;

  @IsNumber()
  @Min(50)
  payment_amount: number;

  @IsDateString()
  @IsOptional()
  deadline?: string;
}

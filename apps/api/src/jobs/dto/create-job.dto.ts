import { IsString, IsNumber, IsOptional, IsUUID, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  organization_id: string;

  @ApiProperty({ example: 'Garden Maintenance' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Weekly garden maintenance including mowing and trimming' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'gardening' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: -26.2041 })
  @IsNumber()
  @IsOptional()
  location_lat?: number;

  @ApiPropertyOptional({ example: 28.0473 })
  @IsNumber()
  @IsOptional()
  location_lng?: number;

  @ApiPropertyOptional({ example: 'Sandton, Johannesburg' })
  @IsString()
  @IsOptional()
  location_address?: string;

  @ApiProperty({ example: 500, minimum: 50, description: 'Amount in ZAR' })
  @IsNumber()
  @Min(50)
  payment_amount: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  deadline?: string;
}

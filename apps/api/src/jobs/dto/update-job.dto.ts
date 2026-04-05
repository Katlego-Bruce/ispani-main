import { IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';

export class UpdateJobDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @Min(50)
  @IsOptional()
  payment_amount?: number;

  @IsOptional()
  @IsIn(['draft', 'open', 'assigned', 'in_progress', 'completed', 'disputed', 'cancelled'])
  status?: string;
}

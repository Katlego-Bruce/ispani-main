import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsIn(['pending', 'verified', 'rejected'])
  kyc_status?: string;
}

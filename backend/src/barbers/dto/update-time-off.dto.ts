import { IsBoolean, IsOptional, IsDateString, IsString } from 'class-validator';

export class UpdateTimeOffDto {
  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

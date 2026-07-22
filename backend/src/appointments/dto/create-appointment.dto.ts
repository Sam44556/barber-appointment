import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  barberId: string;

  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @IsNotEmpty()
  @IsDateString()
  start: string;

  @IsOptional()
  @IsString()
  note?: string;
}

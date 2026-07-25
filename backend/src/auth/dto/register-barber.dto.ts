import { IsString, IsEmail, IsOptional, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterBarberDto {
  @ApiProperty({ example: 'abc123-token-here' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'John Smith' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'barber@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '+1 (555) 123-4567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ 
    example: 'Hair cuts, Beard styling, Hair coloring, Straight razor shaves',
    required: false 
  })
  @IsOptional()
  @IsString()
  specializations?: string;

  @ApiProperty({ 
    description: 'Profile photo (will be handled separately)',
    required: false 
  })
  @IsOptional()
  photo?: any; // Will handle file upload later
}
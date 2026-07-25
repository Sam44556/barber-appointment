import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BarbersService } from './barbers.service';
import { BarbersController } from './barbers.controller';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryService } from '../common/services/cloudinary.service';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [BarbersController],
  providers: [BarbersService, CloudinaryService],
  exports: [BarbersService, CloudinaryService],
})
export class BarbersModule {}

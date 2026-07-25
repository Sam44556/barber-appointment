import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AvailabilityService } from './availability.service';
import { AppointmentsController } from './appointments.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AvailabilityService],
  exports: [AppointmentsService, AvailabilityService],
})
export class AppointmentsModule {}

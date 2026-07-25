import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { EmailService } from '../common/services/email.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, EmailService],
  exports: [AdminService],
})
export class AdminModule {}
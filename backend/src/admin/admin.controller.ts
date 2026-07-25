import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { InviteBarberDto } from './dto/invite-barber.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('invite-barber')
  @ApiOperation({ summary: 'Send invitation to barber' })
  async inviteBarber(
    @Body() inviteBarberDto: InviteBarberDto,
    @CurrentUser() user: any,
  ) {
    return this.adminService.inviteBarber(inviteBarberDto, user.id);
  }
}
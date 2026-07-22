import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('appointments')
@UseGuards(AuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // ============================================
  // CUSTOMER ROUTES
  // ============================================

  // Customer: Create appointment
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Req() req: any) {
    return this.appointmentsService.create(createAppointmentDto, req.user.id);
  }

  // Customer: Get my appointments
  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  getMyAppointments(@Req() req: any) {
    return this.appointmentsService.getMyAppointments(req.user.id);
  }

  // Customer: Get specific appointment (must be mine)
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER, Role.BARBER, Role.ADMIN)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.appointmentsService.findOne(id, req.user.id, req.user.role);
  }

  // Customer: Update appointment (reschedule)
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Req() req: any,
  ) {
    return this.appointmentsService.update(
      id,
      updateAppointmentDto,
      req.user.id,
      req.user.role,
    );
  }

  // Customer: Cancel appointment
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  cancelAppointment(@Param('id') id: string, @Req() req: any) {
    return this.appointmentsService.cancel(id, req.user.id, req.user.role);
  }

  // ============================================
  // BARBER ROUTES
  // ============================================

  // Barber: Get my appointments
  @Get('barber/my-appointments')
  @UseGuards(RolesGuard)
  @Roles(Role.BARBER)
  getBarberAppointments(@Req() req: any) {
    return this.appointmentsService.getBarberAppointments(req.user.id);
  }

  // Barber: Update appointment status (confirm/complete)
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.BARBER, Role.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
    @Req() req: any,
  ) {
    return this.appointmentsService.updateStatus(
      id,
      updateStatusDto,
      req.user.id,
      req.user.role,
    );
  }

  // ============================================
  // ADMIN ROUTES
  // ============================================

  // Admin: Get all appointments
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getAllAppointments() {
    return this.appointmentsService.findAll();
  }

  // Admin: Delete appointment (hard delete)
  @Delete('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}

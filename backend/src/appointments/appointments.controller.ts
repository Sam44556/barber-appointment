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
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AvailabilityService } from './availability.service';
import type { TimeSlot } from './availability.service';
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
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  // ============================================
  // CUSTOMER ROUTES
  // ============================================

  // Get available time slots for booking
  @Get('availability')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER, Role.ADMIN, Role.BARBER)
  async getAvailability(
    @Query('date') date: string,
    @Query('serviceId') serviceId?: string,
    @Query('barberId') barberId?: string,
  ): Promise<TimeSlot[]> {
    if (!date) {
      throw new Error('Date parameter is required (YYYY-MM-DD format)');
    }

    console.log('🎯 Controller: Availability request received:', { date, serviceId, barberId });
    
    try {
      const slots = await this.availabilityService.getAvailableSlots({
        date,
        serviceId,
        barberId,
      });
      
      console.log('📤 Controller: Returning slots:', slots.length);
      return slots;
    } catch (error) {
      console.error('❌ Controller: Availability error:', error);
      throw error;
    }
  }

  // Test endpoint to debug availability
  @Get('availability/test')
  async testAvailability() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    console.log('🧪 Testing availability for:', dateString);
    
    try {
      const slots = await this.availabilityService.getAvailableSlots({
        date: dateString,
      });
      
      return {
        success: true,
        date: dateString,
        totalSlots: slots.length,
        availableSlots: slots.filter(s => s.available).length,
        sampleSlots: slots.slice(0, 5),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }

  // Customer: Create appointment (ADMIN can also book on behalf of customers)
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER, Role.ADMIN)
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Req() req: any) {
    return this.appointmentsService.create(createAppointmentDto, req.user.id);
  }

  // Customer: Get my appointments
  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER, Role.ADMIN)
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
  @Roles(Role.CUSTOMER, Role.ADMIN)
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

  // ============================================
  // ADMIN SHOP CLOSURES ENDPOINTS
  // ============================================

  @Get('admin/shop-closures')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getShopClosures() {
    return this.appointmentsService.getShopClosures();
  }

  @Post('admin/shop-closures')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  createShopClosure(
    @Body() dto: { allDay: boolean; start?: string; end?: string; reason?: string },
  ) {
    return this.appointmentsService.createShopClosure(dto);
  }

  @Patch('admin/shop-closures/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateShopClosure(
    @Param('id') id: string,
    @Body() dto: { allDay?: boolean; start?: string; end?: string; reason?: string },
  ) {
    return this.appointmentsService.updateShopClosure(id, dto);
  }

  @Delete('admin/shop-closures/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  deleteShopClosure(@Param('id') id: string) {
    return this.appointmentsService.deleteShopClosure(id);
  }
}

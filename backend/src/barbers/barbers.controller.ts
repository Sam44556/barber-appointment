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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { BarbersService } from './barbers.service';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { CreateBarberDto } from './dto/create-barber.dto';
import { UpdateBarberDto } from './dto/update-barber.dto';
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { UpdateTimeOffDto } from './dto/update-time-off.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Barbers')
@Controller('barbers')
export class BarbersController {
  constructor(
    private readonly barbersService: BarbersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // 1. Create barber (Admin only)
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new barber (Admin only)' })
  @ApiResponse({ status: 201, description: 'Barber successfully created' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  createBarber(@Body() createBarberDto: CreateBarberDto) {
    return this.barbersService.create(createBarberDto);
  }

  // 2. Find all barbers (Public)
  @Get()
  @ApiOperation({ summary: 'Get all active barbers' })
  @ApiResponse({ status: 200, description: 'List of all active barbers' })
  findAllBarbers() {
    return this.barbersService.findAll();
  }

  // 3. Get my profile (Barber only)
  @Get('me')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.BARBER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my barber profile (Barber only)' })
  @ApiResponse({ status: 200, description: 'Barber profile details' })
  @ApiResponse({ status: 403, description: 'Forbidden - Barber access required' })
  getMyProfile(@Req() req: any) {
    return this.barbersService.getMyProfile(req.user.id);
  }

  // 3b. Update my profile (Supports text fields AND photo file together)
  @Patch('me')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.BARBER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update my barber profile with photo file & details (Barber only)' })
  @ApiResponse({ status: 200, description: 'Updated barber profile' })
  @ApiResponse({ status: 403, description: 'Forbidden - Barber access required' })
  async updateMyProfile(
    @Req() req: any,
    @Body() dto: { name?: string; phone?: string; image?: string; specializations?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl = dto.image;

    // If an image file was uploaded, upload to Cloudinary and get CDN URL
    if (file) {
      try {
        imageUrl = await this.cloudinaryService.uploadImage(file, 'barber_avatars');
      } catch (err: any) {
        console.error('Cloudinary upload error:', err);
      }
    }

    return this.barbersService.updateMyProfile(req.user.id, {
      ...dto,
      image: imageUrl,
    });
  }

  // 4. Get my appointments (Barber only)
  @Get('me/appointments')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.BARBER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my appointments (Barber only)' })
  @ApiResponse({ status: 200, description: 'List of barber appointments' })
  @ApiResponse({ status: 403, description: 'Forbidden - Barber access required' })
  getMyAppointments(@Req() req: any) {
    return this.barbersService.getMyAppointments(req.user.id);
  }

  // 5. Create time-off (Barber creates their own)
  @Post('me/time-off')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.BARBER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create time-off period (Barber only)' })
  @ApiResponse({ status: 201, description: 'Time-off successfully created' })
  @ApiResponse({ status: 403, description: 'Forbidden - Barber access required' })
  createTimeOff(@Body() createTimeOffDto: CreateTimeOffDto, @Req() req: any) {
    return this.barbersService.createMyTimeOff(req.user.id, createTimeOffDto);
  }

  // 6. Get my time-off (Barber views their own)
  @Get('me/time-off')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.BARBER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my time-off periods (Barber only)' })
  @ApiResponse({ status: 200, description: 'List of time-off periods' })
  @ApiResponse({ status: 403, description: 'Forbidden - Barber access required' })
  getMyTimeOff(@Req() req: any) {
    return this.barbersService.getMyTimeOff(req.user.id);
  }

  // 7. Update time-off (Barber updates their own)
  @Patch('me/time-off/:timeOffId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.BARBER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update time-off period (Barber only)' })
  @ApiParam({ name: 'timeOffId', description: 'Time-off ID' })
  @ApiResponse({ status: 200, description: 'Time-off successfully updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Barber access required' })
  @ApiResponse({ status: 404, description: 'Time-off not found' })
  updateTimeOff(
    @Param('timeOffId') timeOffId: string,
    @Body() updateTimeOffDto: UpdateTimeOffDto,
    @Req() req: any,
  ) {
    return this.barbersService.updateMyTimeOff(req.user.id, timeOffId, updateTimeOffDto);
  }

  // 8. Delete time-off (Barber deletes their own)
  @Delete('me/time-off/:timeOffId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.BARBER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete time-off period (Barber only)' })
  @ApiParam({ name: 'timeOffId', description: 'Time-off ID' })
  @ApiResponse({ status: 200, description: 'Time-off successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Barber access required' })
  @ApiResponse({ status: 404, description: 'Time-off not found' })
  deleteTimeOff(@Param('timeOffId') timeOffId: string, @Req() req: any) {
    return this.barbersService.deleteMyTimeOff(req.user.id, timeOffId);
  }

  // ============================================
  // ADMIN: Manage any barber's time-off
  // ============================================

  // Admin: Get all time-off for a specific barber
  @Get('admin/:barberId/time-off')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all time-off for a barber (Admin only)' })
  adminGetBarberTimeOff(@Param('barberId') barberId: string) {
    return this.barbersService.adminGetBarberTimeOff(barberId);
  }

  // Admin: Create time-off for a specific barber
  @Post('admin/:barberId/time-off')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create time-off for a barber (Admin only)' })
  adminCreateBarberTimeOff(
    @Param('barberId') barberId: string,
    @Body() createTimeOffDto: CreateTimeOffDto,
  ) {
    return this.barbersService.adminCreateBarberTimeOff(barberId, createTimeOffDto);
  }

  // Admin: Update any time-off (blocks if already started)
  @Patch('admin/time-off/:timeOffId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update time-off (Admin only, blocked if started)' })
  adminUpdateTimeOff(
    @Param('timeOffId') timeOffId: string,
    @Body() updateTimeOffDto: UpdateTimeOffDto,
  ) {
    return this.barbersService.adminUpdateTimeOff(timeOffId, updateTimeOffDto);
  }

  // Admin: Delete any time-off (blocks if already started)
  @Delete('admin/time-off/:timeOffId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete time-off (Admin only, blocked if started)' })
  adminDeleteTimeOff(@Param('timeOffId') timeOffId: string) {
    return this.barbersService.adminDeleteTimeOff(timeOffId);
  }

  // 9. Find barber by ID (Public)
  @Get(':id')
  @ApiOperation({ summary: 'Get barber by ID' })
  @ApiParam({ name: 'id', description: 'Barber ID' })
  @ApiResponse({ status: 200, description: 'Barber details' })
  @ApiResponse({ status: 404, description: 'Barber not found' })
  findBarberById(@Param('id') id: string) {
    return this.barbersService.findOne(id);
  }

  // 10. Update barber (Admin only)
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update barber details (Admin only)' })
  @ApiParam({ name: 'id', description: 'Barber ID' })
  @ApiResponse({ status: 200, description: 'Barber successfully updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Barber not found' })
  updateBarber(@Param('id') id: string, @Body() updateBarberDto: UpdateBarberDto) {
    return this.barbersService.update(id, updateBarberDto);
  }

  // 11. Delete barber (Admin only)
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete barber (Admin only)' })
  @ApiParam({ name: 'id', description: 'Barber ID' })
  @ApiResponse({ status: 200, description: 'Barber successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Barber not found' })
  deleteBarber(@Param('id') id: string) {
    return this.barbersService.remove(id);
  }
}

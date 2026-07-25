import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBarberDto } from './dto/create-barber.dto';
import { UpdateBarberDto } from './dto/update-barber.dto';
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { UpdateTimeOffDto } from './dto/update-time-off.dto';

@Injectable()
export class BarbersService {
  constructor(private prisma: PrismaService) {}

  async create(createBarberDto: CreateBarberDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createBarberDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Create user account with BARBER role
    const user = await this.prisma.user.create({
      data: {
        id: Math.random().toString(36).substring(7), // Generate random ID
        name: createBarberDto.name,
        email: createBarberDto.email,
        phone: createBarberDto.phone,
        role: 'BARBER',
        emailVerified: false,
      },
    });

    // Create account with password (for Better Auth)
    await this.prisma.account.create({
      data: {
        id: Math.random().toString(36).substring(7),
        accountId: user.id,
        providerId: 'credential',
        userId: user.id,
        password: createBarberDto.password, // In production, hash this!
      },
    });

    // Create barber profile
    const barber = await this.prisma.barber.create({
      data: {
        userId: user.id,
        isActive: true,
      },
      include: {
        user: true,
      },
    });

    return barber;
  }

  async findAll() {
    return this.prisma.barber.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const barber = await this.prisma.barber.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        appointments: {
          include: {
            customer: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            service: true,
          },
          orderBy: {
            start: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!barber) {
      throw new NotFoundException('Barber not found');
    }

    return barber;
  }

  async update(id: string, updateBarberDto: UpdateBarberDto) {
    const barber = await this.findOne(id);

    // Update user info if provided
    if (updateBarberDto.name || updateBarberDto.phone) {
      await this.prisma.user.update({
        where: { id: barber.userId },
        data: {
          ...(updateBarberDto.name && { name: updateBarberDto.name }),
          ...(updateBarberDto.phone && { phone: updateBarberDto.phone }),
        },
      });
    }

    // Update barber isActive if provided
    if (updateBarberDto.isActive !== undefined) {
      await this.prisma.barber.update({
        where: { id },
        data: { isActive: updateBarberDto.isActive },
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.barber.delete({
      where: { id },
    });
  }

  // Get barber's own profile
  async getMyProfile(userId: string) {
    const barber = await this.prisma.barber.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            role: true,
          },
        },
        _count: {
          select: {
            appointments: true,
            timeOff: true,
          },
        },
      },
    });

    if (!barber) {
      throw new NotFoundException('Barber profile not found');
    }

    return barber;
  }

  // Update barber's own profile (User name/phone/image + Barber specializations)
  async updateMyProfile(
    userId: string,
    dto: { name?: string; phone?: string; image?: string; specializations?: string },
  ) {
    const barber = await this.prisma.barber.findUnique({
      where: { userId },
    });

    if (!barber) {
      throw new NotFoundException('Barber profile not found');
    }

    const userUpdateData: any = {};
    if (dto.name !== undefined && dto.name !== '') userUpdateData.name = dto.name;
    if (dto.phone !== undefined) userUpdateData.phone = dto.phone;
    if (dto.image !== undefined && dto.image !== '') userUpdateData.image = dto.image;

    const updatePromises: Promise<any>[] = [];

    if (Object.keys(userUpdateData).length > 0) {
      updatePromises.push(
        this.prisma.user.update({
          where: { id: userId },
          data: userUpdateData,
        }),
      );
    }

    if (dto.specializations !== undefined || dto.image !== undefined) {
      updatePromises.push(
        this.prisma.barber.update({
          where: { id: barber.id },
          data: {
            ...(dto.specializations !== undefined ? { specializations: dto.specializations } : {}),
            ...(dto.image ? { photo: dto.image } : {}),
          },
        }),
      );
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    return this.getMyProfile(userId);
  }

  // Get barber's own appointments
  async getMyAppointments(userId: string) {
    const barber = await this.prisma.barber.findUnique({
      where: { userId },
    });

    if (!barber) {
      throw new NotFoundException('Barber profile not found');
    }

    return this.prisma.appointment.findMany({
      where: { barberId: barber.id },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        service: true,
      },
      orderBy: { start: 'desc' },
    });
  }

  // Create barber's own time-off
  async createMyTimeOff(userId: string, createTimeOffDto: CreateTimeOffDto) {
    const barber = await this.prisma.barber.findUnique({
      where: { userId },
    });

    if (!barber) {
      throw new NotFoundException('Barber profile not found');
    }

    return this.prisma.barberTimeOff.create({
      data: {
        barberId: barber.id,
        allDay: createTimeOffDto.allDay,
        start: createTimeOffDto.start ? new Date(createTimeOffDto.start) : null,
        end: createTimeOffDto.end ? new Date(createTimeOffDto.end) : null,
        reason: createTimeOffDto.reason,
      },
    });
  }

  // Get barber's own time-off
  async getMyTimeOff(userId: string) {
    const barber = await this.prisma.barber.findUnique({
      where: { userId },
    });

    if (!barber) {
      throw new NotFoundException('Barber profile not found');
    }

    return this.prisma.barberTimeOff.findMany({
      where: { barberId: barber.id },
      orderBy: { start: 'desc' },
    });
  }

  // Update barber's own time-off (blocked if already started)
  async updateMyTimeOff(userId: string, timeOffId: string, updateTimeOffDto: UpdateTimeOffDto) {
    const barber = await this.prisma.barber.findUnique({ where: { userId } });
    if (!barber) throw new NotFoundException('Barber profile not found');

    const timeOff = await this.prisma.barberTimeOff.findUnique({ where: { id: timeOffId } });
    if (!timeOff || timeOff.barberId !== barber.id) {
      throw new ForbiddenException('You can only update your own time-off');
    }

    // Block if already started
    if (timeOff.start && new Date(timeOff.start) <= new Date()) {
      throw new BadRequestException('Cannot update a time-off period that has already started');
    }

    const updateData: any = { ...updateTimeOffDto };
    if (updateTimeOffDto.start) updateData.start = new Date(updateTimeOffDto.start);
    if (updateTimeOffDto.end)   updateData.end   = new Date(updateTimeOffDto.end);

    return this.prisma.barberTimeOff.update({ where: { id: timeOffId }, data: updateData });
  }

  // Delete barber's own time-off (blocked if already started)
  async deleteMyTimeOff(userId: string, timeOffId: string) {
    const barber = await this.prisma.barber.findUnique({ where: { userId } });
    if (!barber) throw new NotFoundException('Barber profile not found');

    const timeOff = await this.prisma.barberTimeOff.findUnique({ where: { id: timeOffId } });
    if (!timeOff || timeOff.barberId !== barber.id) {
      throw new ForbiddenException('You can only delete your own time-off');
    }

    // Block if already started
    if (timeOff.start && new Date(timeOff.start) <= new Date()) {
      throw new BadRequestException('Cannot delete a time-off period that has already started');
    }

    return this.prisma.barberTimeOff.delete({ where: { id: timeOffId } });
  }

  // ─── ADMIN: manage any barber's time-off ────────────────────

  async adminGetBarberTimeOff(barberId: string) {
    await this.findOne(barberId); // ensure barber exists
    return this.prisma.barberTimeOff.findMany({
      where: { barberId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminCreateBarberTimeOff(barberId: string, dto: CreateTimeOffDto) {
    await this.findOne(barberId);
    return this.prisma.barberTimeOff.create({
      data: {
        barberId,
        allDay: dto.allDay,
        start:  dto.start ? new Date(dto.start) : null,
        end:    dto.end   ? new Date(dto.end)   : null,
        reason: dto.reason,
      },
    });
  }

  async adminUpdateTimeOff(timeOffId: string, dto: UpdateTimeOffDto) {
    const timeOff = await this.prisma.barberTimeOff.findUnique({ where: { id: timeOffId } });
    if (!timeOff) throw new NotFoundException('Time-off not found');

    // Block if already started
    if (timeOff.start && new Date(timeOff.start) <= new Date()) {
      throw new BadRequestException('Cannot update a time-off period that has already started');
    }

    const data: any = { ...dto };
    if (dto.start) data.start = new Date(dto.start);
    if (dto.end)   data.end   = new Date(dto.end);

    return this.prisma.barberTimeOff.update({ where: { id: timeOffId }, data });
  }

  async adminDeleteTimeOff(timeOffId: string) {
    const timeOff = await this.prisma.barberTimeOff.findUnique({ where: { id: timeOffId } });
    if (!timeOff) throw new NotFoundException('Time-off not found');

    // Block if already started
    if (timeOff.start && new Date(timeOff.start) <= new Date()) {
      throw new BadRequestException('Cannot delete a time-off period that has already started');
    }

    return this.prisma.barberTimeOff.delete({ where: { id: timeOffId } });
  }

  async getAvailableSlots(barberId: string, date: Date) {
    await this.findOne(barberId);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        barberId,
        start: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
      orderBy: {
        start: 'asc',
      },
    });

    return appointments;
  }

  // Old time-off methods (kept for backward compatibility)
  async createTimeOff(barberId: string, createTimeOffDto: CreateTimeOffDto, user: any) {
    const barber = await this.findOne(barberId);

    if (user.role !== 'ADMIN' && barber.userId !== user.id) {
      throw new ForbiddenException('You can only manage your own time-off');
    }

    return this.prisma.barberTimeOff.create({
      data: {
        barberId,
        allDay: createTimeOffDto.allDay,
        start: createTimeOffDto.start ? new Date(createTimeOffDto.start) : null,
        end: createTimeOffDto.end ? new Date(createTimeOffDto.end) : null,
        reason: createTimeOffDto.reason,
      },
    });
  }

  async getTimeOff(barberId: string) {
    await this.findOne(barberId);

    return this.prisma.barberTimeOff.findMany({
      where: { barberId },
      orderBy: { start: 'desc' },
    });
  }

  async updateTimeOff(timeOffId: string, updateTimeOffDto: UpdateTimeOffDto, user: any) {
    const timeOff = await this.prisma.barberTimeOff.findUnique({
      where: { id: timeOffId },
      include: { barber: true },
    });

    if (!timeOff) {
      throw new NotFoundException('Time-off not found');
    }

    if (user.role !== 'ADMIN' && timeOff.barber.userId !== user.id) {
      throw new ForbiddenException('You can only manage your own time-off');
    }

    const updateData: any = { ...updateTimeOffDto };
    if (updateTimeOffDto.start) {
      updateData.start = new Date(updateTimeOffDto.start);
    }
    if (updateTimeOffDto.end) {
      updateData.end = new Date(updateTimeOffDto.end);
    }

    return this.prisma.barberTimeOff.update({
      where: { id: timeOffId },
      data: updateData,
    });
  }

  async removeTimeOff(timeOffId: string, user: any) {
    const timeOff = await this.prisma.barberTimeOff.findUnique({
      where: { id: timeOffId },
      include: { barber: true },
    });

    if (!timeOff) {
      throw new NotFoundException('Time-off not found');
    }

    if (user.role !== 'ADMIN' && timeOff.barber.userId !== user.id) {
      throw new ForbiddenException('You can only manage your own time-off');
    }

    return this.prisma.barberTimeOff.delete({
      where: { id: timeOffId },
    });
  }
}

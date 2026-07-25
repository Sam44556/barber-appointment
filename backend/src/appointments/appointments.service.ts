import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus, Role } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto, userId: string) {
    // Verify barber exists
    const barber = await this.prisma.barber.findUnique({
      where: { id: createAppointmentDto.barberId },
    });

    if (!barber || !barber.isActive) {
      throw new NotFoundException('Barber not found or inactive');
    }

    // Verify service exists
    const service = await this.prisma.service.findUnique({
      where: { id: createAppointmentDto.serviceId },
    });

    if (!service || !service.isActive) {
      throw new NotFoundException('Service not found or inactive');
    }

    const start = new Date(createAppointmentDto.start);
    const end = new Date(start.getTime() + service.duration * 60000);

    // Check for conflicts
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        barberId: createAppointmentDto.barberId,
        status: {
          notIn: [AppointmentStatus.CANCELLED],
        },
        OR: [
          {
            AND: [
              { start: { lte: start } },
              { end: { gt: start } },
            ],
          },
          {
            AND: [
              { start: { lt: end } },
              { end: { gte: end } },
            ],
          },
        ],
      },
    });

    if (conflict) {
      throw new BadRequestException('Time slot already booked');
    }

    return this.prisma.appointment.create({
      data: {
        customerId: userId,
        barberId: createAppointmentDto.barberId,
        serviceId: createAppointmentDto.serviceId,
        start,
        end,
        note: createAppointmentDto.note,
        status: AppointmentStatus.PENDING,
      },
      include: {
        barber: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        service: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        barber: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        service: true,
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        start: 'desc',
      },
    });
  }

  async getMyAppointments(userId: string) {
    return this.prisma.appointment.findMany({
      where: {
        customerId: userId,
      },
      include: {
        barber: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        service: true,
      },
      orderBy: {
        start: 'desc',
      },
    });
  }

  async getBarberAppointments(userId: string) {
    const barber = await this.prisma.barber.findUnique({
      where: { userId },
    });

    if (!barber) {
      throw new NotFoundException('Barber profile not found');
    }

    return this.prisma.appointment.findMany({
      where: {
        barberId: barber.id,
      },
      include: {
        service: true,
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        start: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, userRole: Role) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        barber: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        service: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check permissions
    if (userRole === Role.CUSTOMER && appointment.customerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (userRole === Role.BARBER) {
      const barber = await this.prisma.barber.findUnique({
        where: { userId },
      });

      if (barber?.id !== appointment.barberId) {
        throw new ForbiddenException('Access denied');
      }
    }

    return appointment;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    userId: string,
    userRole: Role,
  ) {
    const appointment = await this.findOne(id, userId, userRole);

    // Only customers can reschedule
    if (userRole !== Role.CUSTOMER) {
      throw new ForbiddenException('Only customers can reschedule appointments');
    }

    const updateData: any = { ...updateAppointmentDto };

    if (updateAppointmentDto.start) {
      const start = new Date(updateAppointmentDto.start);
      const service = await this.prisma.service.findUnique({
        where: { id: appointment.serviceId },
      });
      updateData.start = start;
      updateData.end = new Date(start.getTime() + service!.duration * 60000);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        barber: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        service: true,
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async updateStatus(
    id: string,
    updateStatusDto: { status: AppointmentStatus },
    userId: string,
    userRole: Role,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { barber: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check permissions
    if (userRole === Role.BARBER) {
      const barber = await this.prisma.barber.findUnique({
        where: { userId },
      });

      if (!barber || barber.id !== appointment.barberId) {
        throw new ForbiddenException('You can only update your own appointments');
      }
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
      },
      include: {
        barber: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        service: true,
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async cancel(id: string, userId: string, userRole: Role) {
    await this.findOne(id, userId, userRole);

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
      },
    });
  }

  async remove(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  // ============================================
  // SHOP CLOSURE METHODS (Admin only)
  // ============================================

  async getShopClosures() {
    return this.prisma.shopClosure.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createShopClosure(dto: { allDay: boolean; start?: string; end?: string; reason?: string }) {
    return this.prisma.shopClosure.create({
      data: {
        allDay: dto.allDay,
        start: dto.start ? new Date(dto.start) : null,
        end: dto.end ? new Date(dto.end) : null,
        reason: dto.reason,
      },
    });
  }

  async updateShopClosure(id: string, dto: { allDay?: boolean; start?: string; end?: string; reason?: string }) {
    const closure = await this.prisma.shopClosure.findUnique({ where: { id } });
    if (!closure) {
      throw new NotFoundException('Shop closure not found');
    }

    // Check if time-off / closure has already started!
    if (closure.start && new Date(closure.start) <= new Date()) {
      throw new BadRequestException('Cannot update a shop closure that has already started');
    }

    const updateData: any = { ...dto };
    if (dto.start) updateData.start = new Date(dto.start);
    if (dto.end) updateData.end = new Date(dto.end);

    return this.prisma.shopClosure.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteShopClosure(id: string) {
    const closure = await this.prisma.shopClosure.findUnique({ where: { id } });
    if (!closure) {
      throw new NotFoundException('Shop closure not found');
    }

    // Check if time-off / closure has already started!
    if (closure.start && new Date(closure.start) <= new Date()) {
      throw new BadRequestException('Cannot delete a shop closure that has already started');
    }

    return this.prisma.shopClosure.delete({
      where: { id },
    });
  }
}

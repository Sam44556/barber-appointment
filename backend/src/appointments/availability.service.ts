import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addMinutes } from 'date-fns';

export interface TimeSlot {
  time: string;       // "HH:mm"
  datetime: string;   // ISO UTC string
  available: boolean;
  barberId?: string;
  barberName?: string;
  reason?: string;
}

interface AvailabilityRequest {
  date: string;       // "YYYY-MM-DD"  (shop LOCAL date)
  serviceId?: string;
  barberId?: string;
}

// ─── Shop hours (LOCAL time, 24h) ────────────────────────────
//  Morning   : 03:00 – 13:00   (slots must END by 13:00)
//  Lunch     : 13:00 – 14:00   (no slots generated)
//  Afternoon : 14:00 – 20:00   (slots must END by 20:00)
// ─────────────────────────────────────────────────────────────
const MORNING_START   = 3  * 60;   // 180 min
const MORNING_END     = 13 * 60;   // 780 min
const AFTERNOON_START = 14 * 60;   // 840 min
const AFTERNOON_END   = 20 * 60;   // 1200 min

/**
 * UTC offset of the shop's local timezone in hours.
 * Ethiopia / Nairobi = +3. Change to match your shop.
 * Example: UTC+3 → SHOP_UTC_OFFSET_HOURS = 3
 */
const SHOP_UTC_OFFSET_HOURS = 3;

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────
  // PUBLIC: getAvailableSlots
  // ─────────────────────────────────────────────────────────────
  async getAvailableSlots(request: AvailabilityRequest): Promise<TimeSlot[]> {
    const { date, serviceId, barberId } = request;
    console.log('🔍 Availability request:', { date, serviceId, barberId });

    // 1. Resolve service duration
    const service = serviceId
      ? await this.prisma.service.findUnique({ where: { id: serviceId } })
      : null;
    const serviceDuration = service?.duration ?? 30;
    console.log(`⏱️  Service duration: ${serviceDuration} min`);

    // 2. Generate candidate time slots based on shop hours
    const timeSlots = this.generateTimeSlots(serviceDuration);
    console.log(`📅 Generated ${timeSlots.length} slots:`, timeSlots.join(', '));

    // 3. Build UTC day boundaries for DB queries
    //    The shop's "00:00" local = UTC midnight - offset
    const { dayStart, dayEnd } = this.buildDayBoundaries(date);
    console.log('🕐 Day boundaries (UTC):', { dayStart: dayStart.toISOString(), dayEnd: dayEnd.toISOString() });

    // 4. Check ALL-DAY shop closure
    const allDayShopClosure = await this.prisma.shopClosure.findFirst({
      where: {
        allDay: true,
        start:  { lte: dayEnd },
        end:    { gte: dayStart },
      },
    });

    if (allDayShopClosure) {
      console.log('🏪 Shop is closed all day');
      return timeSlots.map(slot => ({
        time:      slot,
        datetime:  this.slotToUtcISO(date, slot),
        available: false,
        reason:    allDayShopClosure.reason ?? 'Shop is closed today',
      }));
    }

    // 5. Fetch partial (time-range) shop closures
    const partialShopClosures = await this.prisma.shopClosure.findMany({
      where: {
        allDay: false,
        start:  { lte: dayEnd },
        end:    { gte: dayStart },
      },
    });

    // 6. Route to specific or any-barber logic
    if (barberId) {
      return this.specificBarberSlots(
        barberId, date, timeSlots, serviceDuration, partialShopClosures, dayStart, dayEnd,
      );
    }
    return this.anyBarberSlots(date, timeSlots, serviceDuration, partialShopClosures);
  }

  // ─────────────────────────────────────────────────────────────
  // SLOT GENERATION
  // ─────────────────────────────────────────────────────────────
  private generateTimeSlots(serviceDuration: number): string[] {
    const slots: string[] = [];

    // Morning 03:00–13:00
    for (let m = MORNING_START; m < MORNING_END; m += serviceDuration) {
      if (m + serviceDuration <= MORNING_END) {
        slots.push(this.minsToHHmm(m));
      }
    }

    // Afternoon 14:00–20:00
    for (let m = AFTERNOON_START; m < AFTERNOON_END; m += serviceDuration) {
      if (m + serviceDuration <= AFTERNOON_END) {
        slots.push(this.minsToHHmm(m));
      }
    }

    return slots;
  }

  // ─────────────────────────────────────────────────────────────
  // SPECIFIC BARBER
  //   1. Barber all-day off?
  //   2. Per slot: shop partial closure → barber time-off → existing appointments
  // ─────────────────────────────────────────────────────────────
  private async specificBarberSlots(
    barberId: string,
    date: string,
    timeSlots: string[],
    serviceDuration: number,
    partialShopClosures: any[],
    dayStart: Date,
    dayEnd: Date,
  ): Promise<TimeSlot[]> {
    console.log(`👤 Specific barber: ${barberId}`);

    const barber = await this.prisma.barber.findUnique({
      where: { id: barberId },
      include: { user: true },
    });

    if (!barber || !barber.isActive) {
      return timeSlots.map(slot => ({
        time: slot, datetime: this.slotToUtcISO(date, slot),
        available: false, reason: 'Barber not available',
      }));
    }

    // Check all-day off
    const barberDayOff = await this.prisma.barberTimeOff.findFirst({
      where: {
        barberId,
        allDay: true,
        start:  { lte: dayEnd },
        end:    { gte: dayStart },
      },
    });

    if (barberDayOff) {
      console.log('🚫 Barber off all day:', barberDayOff.reason);
      return timeSlots.map(slot => ({
        time: slot, datetime: this.slotToUtcISO(date, slot),
        available: false, barberId: barber.id, barberName: barber.user.name,
        reason: barberDayOff.reason ?? 'Barber is off today',
      }));
    }

    // Fetch barber's partial time-offs and appointments
    const [barberTimeOffs, barberAppointments] = await Promise.all([
      this.prisma.barberTimeOff.findMany({
        where: { barberId, allDay: false, start: { lte: dayEnd }, end: { gte: dayStart } },
      }),
      this.prisma.appointment.findMany({
        where: { barberId, start: { gte: dayStart, lte: dayEnd }, status: { notIn: ['CANCELLED'] } },
        include: { service: true },
      }),
    ]);

    console.log(`📋 Barber data — timeOffs: ${barberTimeOffs.length}, appointments: ${barberAppointments.length}`);

    return timeSlots.map(slot => {
      const slotStart = this.slotToDate(date, slot);
      const slotEnd   = addMinutes(slotStart, serviceDuration);
      const datetime  = slotStart.toISOString();

      const shopConflict = this.findOverlap(slotStart, slotEnd, partialShopClosures);
      if (shopConflict) return {
        time: slot, datetime, available: false,
        barberId: barber.id, barberName: barber.user.name,
        reason: shopConflict.reason ?? 'Shop closed during this time',
      };

      const timeOffConflict = this.findOverlap(slotStart, slotEnd, barberTimeOffs);
      if (timeOffConflict) return {
        time: slot, datetime, available: false,
        barberId: barber.id, barberName: barber.user.name,
        reason: timeOffConflict.reason ?? 'Barber is off during this time',
      };

      const aptConflict = this.findAppointmentOverlap(slotStart, slotEnd, barberAppointments);
      if (aptConflict) return {
        time: slot, datetime, available: false,
        barberId: barber.id, barberName: barber.user.name,
        reason: 'Already booked',
      };

      return { time: slot, datetime, available: true, barberId: barber.id, barberName: barber.user.name };
    });
  }

  // ─────────────────────────────────────────────────────────────
  // ANY BARBER
  //   Per requirement: ONLY check shop closure.
  //   Do NOT loop through barbers here — barber assigned at booking.
  // ─────────────────────────────────────────────────────────────
  private anyBarberSlots(
    date: string,
    timeSlots: string[],
    serviceDuration: number,
    partialShopClosures: any[],
  ): TimeSlot[] {
    console.log('👥 Any barber — shop closure check only');

    return timeSlots.map(slot => {
      const slotStart = this.slotToDate(date, slot);
      const slotEnd   = addMinutes(slotStart, serviceDuration);
      const datetime  = slotStart.toISOString();

      const shopConflict = this.findOverlap(slotStart, slotEnd, partialShopClosures);
      if (shopConflict) return {
        time: slot, datetime, available: false,
        reason: shopConflict.reason ?? 'Shop closed during this time',
      };

      return { time: slot, datetime, available: true };
    });
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────

  /** "HH:mm" → slot local time → UTC Date */
  private slotToDate(date: string, slot: string): Date {
    const [hh, mm] = slot.split(':').map(Number);
    // Build UTC from local time: subtract the shop's UTC offset
    const utcMs =
      Date.UTC(
        Number(date.slice(0, 4)),   // year
        Number(date.slice(5, 7)) - 1, // month (0-indexed)
        Number(date.slice(8, 10)), // day
        hh,
        mm,
        0,
        0,
      ) - SHOP_UTC_OFFSET_HOURS * 60 * 60 * 1000;
    return new Date(utcMs);
  }

  private slotToUtcISO(date: string, slot: string): string {
    return this.slotToDate(date, slot).toISOString();
  }

  /** UTC day start/end for the shop's LOCAL date */
  private buildDayBoundaries(date: string): { dayStart: Date; dayEnd: Date } {
    const dayStart = this.slotToDate(date, '00:00');
    const dayEnd   = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    return { dayStart, dayEnd };
  }

  private minsToHHmm(totalMins: number): string {
    return `${Math.floor(totalMins / 60).toString().padStart(2, '0')}:${(totalMins % 60).toString().padStart(2, '0')}`;
  }

  /** Generic range overlap: [slotStart, slotEnd) vs [rec.start, rec.end) */
  private findOverlap(slotStart: Date, slotEnd: Date, records: any[]): any | null {
    for (const rec of records) {
      if (!rec.start || !rec.end) continue;
      const recStart = new Date(rec.start);
      const recEnd   = new Date(rec.end);
      if (slotStart < recEnd && slotEnd > recStart) return rec;
    }
    return null;
  }

  private findAppointmentOverlap(slotStart: Date, slotEnd: Date, appointments: any[]): any | null {
    for (const apt of appointments) {
      const aptStart = new Date(apt.start);
      const aptEnd   = addMinutes(aptStart, apt.service?.duration ?? 30);
      if (slotStart < aptEnd && slotEnd > aptStart) return apt;
    }
    return null;
  }
}
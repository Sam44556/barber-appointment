import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FADE_UP } from '@/lib/animations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, User, Store } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface BarberData {
  id: string;
  user: { name: string; image?: string };
}

interface AppointmentData {
  id: string;
  start: string;
  end: string;
  status: string;
  customer: { name: string; phone?: string };
  barber: { id: string; user: { name: string } };
  service: { name: string; duration: number };
}

interface ShopClosureData {
  id: string;
  allDay: boolean;
  start: string | null;
  end: string | null;
  reason: string | null;
}

// Operating hours 03:00 to 20:00 (hourly breakdown)
const OPERATING_HOURS = [
  '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', // Lunch
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function AdminSchedule() {
  const [selectedDate, setSelectedDate]   = useState<Date>(new Date());
  const [barbers, setBarbers]             = useState<BarberData[]>([]);
  const [appointments, setAppointments]   = useState<AppointmentData[]>([]);
  const [closures, setClosures]           = useState<ShopClosureData[]>([]);
  const [loading, setLoading]             = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [barbersData, aptsData, closuresData] = await Promise.all([
        apiService.getBarbers(),
        apiService.getAllAppointments(),
        apiService.getShopClosures(),
      ]);
      setBarbers(barbersData.filter((b: any) => b.isActive));
      setAppointments(aptsData.filter((a: any) => a.status !== 'CANCELLED'));
      setClosures(closuresData);
    } catch (err: any) {
      toast.error('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Appointments for selected date
  const dayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const aptDate = parseISO(apt.start);
      return isSameDay(aptDate, selectedDate);
    });
  }, [appointments, selectedDate]);

  // Check if shop is closed all day on selected date
  const isShopClosedToday = useMemo(() => {
    return closures.some((c) => {
      if (!c.start) return false;
      const closureStart = parseISO(c.start);
      return c.allDay && isSameDay(closureStart, selectedDate);
    });
  }, [closures, selectedDate]);

  const shopClosureReason = useMemo(() => {
    const found = closures.find((c) => {
      if (!c.start) return false;
      return c.allDay && isSameDay(parseISO(c.start), selectedDate);
    });
    return found?.reason || 'Shop Closed Today';
  }, [closures, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Live Shop Schedule</h1>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            Real-time barber schedules and bookings from database
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedDate((d) => addDays(d, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs"
            onClick={() => setSelectedDate(new Date())}
          >
            Today ({format(new Date(), 'dd MMM')})
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-sm border border-border">
        <p className="font-display font-bold text-base flex items-center gap-2">
          <CalendarIcon size={16} />
          {format(selectedDate, 'EEEE, d MMMM yyyy')}
        </p>
        {isShopClosedToday && (
          <span className="font-mono text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200 font-semibold flex items-center gap-1">
            <Store size={12} /> {shopClosureReason}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
        </div>
      ) : isShopClosedToday ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-sm text-center">
          <Store className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <h3 className="font-display font-bold text-lg text-red-900">Shop Closed</h3>
          <p className="font-body text-sm text-red-700 mt-1">{shopClosureReason}</p>
        </div>
      ) : barbers.length === 0 ? (
        <div className="text-center py-20 font-body text-sm text-muted-foreground">
          No active barbers found in database.
        </div>
      ) : (
        <motion.div variants={FADE_UP} initial="hidden" animate="visible">
          <Card className="rounded-sm border-border overflow-hidden">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b bg-secondary/40">
                    <th className="p-3 text-left font-mono text-xs text-muted-foreground w-24">
                      Time (24h)
                    </th>
                    {barbers.map((b) => (
                      <th key={b.id} className="p-3 text-left">
                        <div className="flex items-center gap-2">
                          {b.user.image ? (
                            <img
                              src={b.user.image}
                              alt={b.user.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {b.user.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-sm font-display font-bold">{b.user.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {OPERATING_HOURS.map((hour) => {
                    const isLunch = hour === '13:00';

                    return (
                      <tr
                        key={hour}
                        className={`border-b last:border-0 transition-colors ${
                          isLunch ? 'bg-amber-50/60' : 'hover:bg-muted/30'
                        }`}
                      >
                        <td className="p-3 font-mono text-xs text-muted-foreground">{hour}</td>
                        {barbers.map((b) => {
                          if (isLunch) {
                            return (
                              <td key={b.id} className="p-2 text-xs font-mono text-amber-700 italic">
                                Lunch Break (13:00 - 14:00)
                              </td>
                            );
                          }

                          // Find appointment matching barber, date, and hour
                          const apt = dayAppointments.find((a) => {
                            if (a.barber?.id !== b.id) return false;
                            const aptHour = format(parseISO(a.start), 'HH:00');
                            return aptHour === hour;
                          });

                          return (
                            <td key={b.id} className="p-2">
                              {apt ? (
                                <div className="bg-primary text-primary-foreground rounded-sm p-2 text-xs shadow-sm">
                                  <p className="font-bold truncate">{apt.customer?.name || 'Customer'}</p>
                                  <p className="opacity-80 text-[11px] truncate">{apt.service?.name}</p>
                                  <span className="inline-block mt-1 font-mono text-[10px] bg-white/20 px-1 rounded">
                                    {format(parseISO(apt.start), 'HH:mm')} - {format(parseISO(apt.end), 'HH:mm')}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] font-mono text-muted-foreground/40">
                                  — Available
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FADE_UP, STAGGER } from '@/lib/animations';
import { useCountUp } from '@/hooks/useCountUp';
import { Card, CardContent } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { Loader2, TrendingUp, Calendar, DollarSign, Award, AlertCircle } from 'lucide-react';
import { format, parseISO, getDay } from 'date-fns';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface AppointmentData {
  id: string;
  start: string;
  end: string;
  status: string;
  barber: { id: string; user: { name: string } };
  service: { id: string; name: string; price: number | string };
}

interface BarberData {
  id: string;
  user: { name: string };
}

const GRAYS = [
  'hsl(0, 0%, 15%)',
  'hsl(0, 0%, 35%)',
  'hsl(0, 0%, 55%)',
  'hsl(0, 0%, 75%)',
  'hsl(0, 0%, 88%)',
];

const StatCard = ({
  label,
  value,
  prefix = '',
  text,
}: {
  label: string;
  value: number;
  prefix?: string;
  text?: string;
}) => {
  const animated = useCountUp(value);
  return (
    <motion.div variants={FADE_UP}>
      <Card className="border-border rounded-sm">
        <CardContent className="p-6">
          {text ? (
            <p className="font-display text-xl font-bold truncate">{text}</p>
          ) : (
            <p className="font-display text-3xl font-bold">
              {prefix}
              {animated.toLocaleString()}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1 font-body">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function AdminAnalytics() {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [barbers, setBarbers]           = useState<BarberData[]>([]);
  const [loading, setLoading]           = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [aptsData, barbersData] = await Promise.all([
        apiService.getAllAppointments(),
        apiService.getBarbers(),
      ]);
      setAppointments(aptsData);
      setBarbers(barbersData);
    } catch {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Valid non-cancelled appointments
  const validAppointments = useMemo(() => {
    return appointments.filter((a) => a.status !== 'CANCELLED');
  }, [appointments]);

  // 1. Total Revenue
  const totalRevenue = useMemo(() => {
    return validAppointments.reduce((acc, a) => acc + Number(a.service?.price || 0), 0);
  }, [validAppointments]);

  // 2. Most Popular Service
  const mostPopularService = useMemo(() => {
    if (validAppointments.length === 0) return 'None';
    const counts: Record<string, number> = {};
    validAppointments.forEach((a) => {
      const name = a.service?.name || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    let topName = 'None';
    let topCount = 0;
    Object.entries(counts).forEach(([name, count]) => {
      if (count > topCount) {
        topCount = count;
        topName = name;
      }
    });
    return topName;
  }, [validAppointments]);

  // 3. Busiest Day of Week
  const busiestDay = useMemo(() => {
    if (validAppointments.length === 0) return 'None';
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts: number[] = [0, 0, 0, 0, 0, 0, 0];
    validAppointments.forEach((a) => {
      const dayIdx = getDay(parseISO(a.start));
      counts[dayIdx]++;
    });
    let maxIdx = 0;
    counts.forEach((c, idx) => {
      if (c > counts[maxIdx]) maxIdx = idx;
    });
    return dayNames[maxIdx];
  }, [validAppointments]);

  // 4. Revenue Trend (by date)
  const revenueChartData = useMemo(() => {
    if (validAppointments.length === 0) return [];
    const dateMap: Record<string, number> = {};
    validAppointments.forEach((a) => {
      const dateStr = format(parseISO(a.start), 'dd MMM');
      dateMap[dateStr] = (dateMap[dateStr] || 0) + Number(a.service?.price || 0);
    });
    return Object.entries(dateMap).map(([date, revenue]) => ({ date, revenue }));
  }, [validAppointments]);

  // 5. Per-Barber Performance
  const barberPerformance = useMemo(() => {
    if (barbers.length === 0) return [];
    return barbers.map((b) => {
      const bApts = validAppointments.filter((a) => a.barber?.id === b.id);
      const cuts = bApts.length;
      const earnings = bApts.reduce((sum, a) => sum + Number(a.service?.price || 0), 0);
      return { name: b.user.name.split(' ')[0], cuts, earnings };
    });
  }, [barbers, validAppointments]);

  // 6. Popular Services Pie Breakdown
  const serviceBreakdown = useMemo(() => {
    if (validAppointments.length === 0) return [];
    const counts: Record<string, number> = {};
    validAppointments.forEach((a) => {
      const name = a.service?.name || 'Other';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [validAppointments]);

  // 7. Busiest Hours Heatmap Data (Days vs 24h Slots)
  const heatmapData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = ['03:00', '06:00', '09:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    
    // Matrix initialization
    const matrix: Record<string, number[]> = {};
    days.forEach((d) => {
      matrix[d] = new Array(hours.length).fill(0);
    });

    validAppointments.forEach((a) => {
      const aptDate = parseISO(a.start);
      const dayIdx  = getDay(aptDate); // 0=Sun, 1=Mon...
      const dayName = days[dayIdx === 0 ? 6 : dayIdx - 1]; // Map to Mon-Sun
      const hourNum = aptDate.getUTCHours() + 3; // Shop UTC offset +3

      // Find closest hour bucket index
      let hourIdx = 0;
      if (hourNum >= 20) hourIdx = 7;
      else if (hourNum >= 18) hourIdx = 6;
      else if (hourNum >= 16) hourIdx = 5;
      else if (hourNum >= 14) hourIdx = 4;
      else if (hourNum >= 12) hourIdx = 3;
      else if (hourNum >= 9) hourIdx = 2;
      else if (hourNum >= 6) hourIdx = 1;
      else hourIdx = 0;

      if (matrix[dayName]) {
        matrix[dayName][hourIdx]++;
      }
    });

    return days.map((day) => ({
      day,
      hours: matrix[day],
    }));
  }, [validAppointments]);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Live Shop Analytics</h1>
        <p className="font-body text-xs text-muted-foreground mt-0.5">
          Calculated dynamically from real booking database records
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : validAppointments.length === 0 ? (
        <div className="text-center py-20 bg-background border border-border rounded-sm">
          <AlertCircle className="mx-auto mb-2 text-muted-foreground" size={36} />
          <p className="font-display font-bold text-base">No Booking Analytics Yet</p>
          <p className="font-body text-xs text-muted-foreground mt-1">
            As customers book appointments, live performance metrics will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Overview Stat Cards */}
          <motion.div
            variants={STAGGER}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard label="Total Revenue" value={totalRevenue} prefix="$" />
            <StatCard label="Total Bookings" value={validAppointments.length} prefix="" />
            <StatCard label="Most Popular Service" value={0} prefix="" text={mostPopularService} />
            <StatCard label="Busiest Operating Day" value={0} prefix="" text={busiestDay} />
          </motion.div>

          {/* Revenue Chart */}
          <motion.div variants={FADE_UP} initial="hidden" animate="visible">
            <Card className="border-border rounded-sm">
              <CardContent className="p-6">
                <h3 className="font-display text-lg font-bold mb-4">Revenue Trend ($)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={revenueChartData}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fontFamily: 'DM Mono' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fontFamily: 'DM Mono' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(40,7%,95%)',
                        border: '1px solid hsl(0,0%,85%)',
                        borderRadius: 4,
                        fontSize: 13,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(0,0%,4%)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'hsl(0,0%,4%)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Per-barber Performance */}
            <motion.div variants={FADE_UP} initial="hidden" animate="visible">
              <Card className="border-border rounded-sm">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-bold mb-4">Barber Performance (Cuts)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barberPerformance} layout="vertical">
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12, fontFamily: 'DM Mono' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 12, fontFamily: 'DM Sans' }}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(40,7%,95%)',
                          border: '1px solid hsl(0,0%,85%)',
                          borderRadius: 4,
                          fontSize: 13,
                        }}
                      />
                      <Bar dataKey="cuts" fill="hsl(0,0%,4%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Popular Services Pie */}
            <motion.div variants={FADE_UP} initial="hidden" animate="visible">
              <Card className="border-border rounded-sm">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-bold mb-4">Service Share</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={serviceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {serviceBreakdown.map((_, i) => (
                          <Cell key={i} fill={GRAYS[i % GRAYS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Busiest Hours Heatmap */}
          <motion.div variants={FADE_UP} initial="hidden" animate="visible">
            <Card className="border-border rounded-sm">
              <CardContent className="p-6">
                <h3 className="font-display text-lg font-bold mb-1">Busiest Hours Heatmap</h3>
                <p className="font-body text-xs text-muted-foreground mb-4">
                  Booking density by day of week and operating hour slot
                </p>
                <div className="overflow-x-auto">
                  <div className="flex gap-1 mb-1">
                    <div className="w-12 shrink-0" />
                    {['03:00', '06:00', '09:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map(
                      (h) => (
                        <div
                          key={h}
                          className="w-12 h-6 flex items-center justify-center font-mono text-[10px] text-muted-foreground"
                        >
                          {h}
                        </div>
                      )
                    )}
                  </div>
                  {heatmapData.map((row) => (
                    <div key={row.day} className="flex gap-1 mb-1">
                      <div className="w-12 shrink-0 text-xs font-mono text-muted-foreground flex items-center">
                        {row.day}
                      </div>
                      {row.hours.map((val, i) => (
                        <div
                          key={i}
                          className="w-12 h-10 rounded-sm flex items-center justify-center text-[10px] font-mono transition-colors"
                          style={{
                            backgroundColor:
                              val > 0
                                ? `hsl(0, 0%, ${Math.max(10, 90 - val * 20)}%)`
                                : 'hsl(0, 0%, 96%)',
                            color: val > 2 ? '#fff' : '#000',
                          }}
                          title={`${val} bookings at ${row.day} ${['03:00', '06:00', '09:00', '12:00', '14:00', '16:00', '18:00', '20:00'][i]}`}
                        >
                          {val > 0 ? val : ''}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}

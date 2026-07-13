import { motion } from 'framer-motion';
import { FADE_UP, STAGGER } from '@/lib/animations';
import { useCountUp } from '@/hooks/useCountUp';
import { Card, CardContent } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const overviewStats = [
  { label: 'Revenue this month', value: 12480, prefix: '$' },
  { label: 'Total bookings', value: 312, prefix: '' },
  { label: 'Most popular', value: 0, prefix: '', text: 'Classic Haircut' },
  { label: 'Busiest day', value: 0, prefix: '', text: 'Saturday' },
];

const revenueData = [
  { week: 'W1', revenue: 2800 },
  { week: 'W2', revenue: 3400 },
  { week: 'W3', revenue: 3100 },
  { week: 'W4', revenue: 3180 },
];

const barberComparison = [
  { name: 'Marcus', cuts: 48, earnings: 2200 },
  { name: 'Alex', cuts: 38, earnings: 1700 },
  { name: 'DeShawn', cuts: 42, earnings: 1900 },
];

const serviceBreakdown = [
  { name: 'Classic Haircut', value: 42 },
  { name: 'Fade', value: 28 },
  { name: 'Beard Trim', value: 18 },
  { name: 'Full Package', value: 12 },
];

const GRAYS = ['hsl(0,0%,4%)', 'hsl(0,0%,24%)', 'hsl(0,0%,53%)', 'hsl(0,0%,73%)'];

const heatmapData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
  day,
  hours: Array.from({ length: 10 }, () => Math.floor(Math.random() * 8)),
}));

const StatCard = ({ label, value, prefix, text }: { label: string; value: number; prefix: string; text?: string }) => {
  const animated = useCountUp(value);
  return (
    <motion.div variants={FADE_UP}>
      <Card>
        <CardContent className="p-6">
          {text ? (
            <p className="font-display text-2xl font-bold">{text}</p>
          ) : (
            <p className="font-display text-3xl font-bold">{prefix}{animated.toLocaleString()}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AdminAnalytics = () => {
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl">Analytics</h1>

      {/* Overview */}
      <motion.div variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((s) => <StatCard key={s.label} {...s} />)}
      </motion.div>

      {/* Revenue chart */}
      <motion.div variants={FADE_UP} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-lg mb-4">Revenue</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
                <XAxis dataKey="week" tick={{ fontSize: 12, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(40,7%,95%)', border: '1px solid hsl(0,0%,85%)', borderRadius: 8, fontFamily: 'DM Sans', fontSize: 13 }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(0,0%,4%)" strokeWidth={2} dot={{ r: 4, fill: 'hsl(0,0%,4%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-barber comparison */}
        <motion.div variants={FADE_UP} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-lg mb-4">Per-Barber Performance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barberComparison} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={{ background: 'hsl(40,7%,95%)', border: '1px solid hsl(0,0%,85%)', borderRadius: 8, fontSize: 13 }} />
                  <Bar dataKey="cuts" fill="hsl(0,0%,4%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Services pie */}
        <motion.div variants={FADE_UP} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-lg mb-4">Popular Services</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={serviceBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {serviceBreakdown.map((_, i) => <Cell key={i} fill={GRAYS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div variants={FADE_UP} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-display text-lg mb-4">Busiest Hours</h3>
            <div className="overflow-x-auto">
              <div className="flex gap-1 mb-1">
                <div className="w-10 shrink-0" />
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="w-10 h-6 flex items-center justify-center font-mono text-[10px] text-muted-foreground">{9 + i}:00</div>
                ))}
              </div>
              {heatmapData.map((row) => (
                <div key={row.day} className="flex gap-1 mb-1">
                  <div className="w-10 shrink-0 text-xs font-mono text-muted-foreground flex items-center">{row.day}</div>
                  {row.hours.map((val, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-sm"
                      style={{ backgroundColor: `hsl(0, 0%, ${Math.max(4, 92 - val * 12)}%)` }}
                      title={`${val} bookings`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;

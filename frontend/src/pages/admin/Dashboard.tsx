import { motion } from 'framer-motion';
import { FADE_UP, STAGGER } from '@/lib/animations';
import { useCountUp } from '@/hooks/useCountUp';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

const stats = [
  { label: "Today's bookings", value: 12, trend: '+15%', up: true },
  { label: "Today's revenue", value: 480, prefix: '$', trend: '+8%', up: true },
  { label: 'Active barbers', value: 3, trend: '', up: true },
  { label: 'Cancellations', value: 1, trend: '-50%', up: false },
];

const todayAppointments = [
  { time: '9:00', customer: 'John Smith', service: 'Classic Haircut', barber: 'Marcus Chen', status: 'Confirmed' },
  { time: '9:30', customer: 'David Lee', service: 'Beard Trim', barber: 'DeShawn Williams', status: 'Confirmed' },
  { time: '10:00', customer: 'Mike Johnson', service: 'Full Package', barber: 'Alex Rivera', status: 'Confirmed' },
  { time: '11:00', customer: 'James Wilson', service: 'Fade', barber: 'Marcus Chen', status: 'Confirmed' },
  { time: '13:00', customer: 'Robert Brown', service: 'Buzz Cut', barber: 'Alex Rivera', status: 'Confirmed' },
  { time: '14:30', customer: 'Chris Davis', service: 'Hot Towel Shave', barber: 'DeShawn Williams', status: 'Confirmed' },
];

const StatCard = ({ label, value, prefix = '', trend, up }: typeof stats[0]) => {
  const animatedValue = useCountUp(value);
  return (
    <motion.div variants={FADE_UP}>
      <Card className="bg-card-foreground text-card border-sidebar-border">
        <CardContent className="p-6">
          <p className="font-display text-4xl font-bold">{prefix}{animatedValue}</p>
          <p className="text-xs text-muted-foreground mt-1 font-body">{label}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span className="text-xs font-mono text-muted-foreground">{trend} vs yesterday</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl italic">{greeting}, {user?.name || 'James'}.</h1>
        <p className="font-mono text-sm text-muted-foreground mt-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      {/* KPI Cards */}
      <motion.div variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </motion.div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Add service</Button>
        <Button variant="outline" className="gap-2"><UserPlus className="h-4 w-4" /> Invite barber</Button>
        <Button variant="outline" className="gap-2"><Clock className="h-4 w-4" /> View schedule</Button>
      </div>

      {/* Today's Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Today's Appointments</h2>
          <Button variant="default" size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add walk-in</Button>
        </div>

        <motion.div variants={STAGGER} initial="hidden" animate="visible" className="space-y-2">
          {todayAppointments.map((apt, i) => (
            <motion.div key={i} variants={FADE_UP}>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="font-mono text-sm text-muted-foreground w-12 shrink-0">{apt.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{apt.customer}</p>
                    <p className="text-xs text-muted-foreground">{apt.service}</p>
                  </div>
                  <div className="hidden sm:block text-sm text-muted-foreground">{apt.barber}</div>
                  <span className="text-[11px] font-mono px-2 py-1 rounded border border-border">{apt.status}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;

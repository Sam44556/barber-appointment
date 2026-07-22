import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FADE_UP, STAGGER } from '@/lib/animations';
import { useCountUp } from '@/hooks/useCountUp';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import type { Appointment } from '@/types';

interface DashboardStats {
  todayBookings: number;
  todayRevenue: number;
  activeBarbers: number;
  todayCancellations: number;
  totalAppointments: number;
}

const StatCard = ({ 
  label, 
  value, 
  prefix = '', 
  trend, 
  up 
}: { 
  label: string; 
  value: number; 
  prefix?: string; 
  trend?: string; 
  up?: boolean; 
}) => {
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
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    todayRevenue: 0,
    activeBarbers: 0,
    todayCancellations: 0,
    totalAppointments: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [appointments, barbers, services] = await Promise.all([
        apiService.getAllAppointments(),
        apiService.getBarbers(),
        apiService.getServices(),
      ]);

      // Calculate today's date
      const today = new Date().toDateString();
      
      // Filter today's appointments
      const todayApts = appointments.filter((apt: Appointment) => 
        new Date(apt.start).toDateString() === today
      );
      
      // Calculate stats
      const todayConfirmed = todayApts.filter((apt: Appointment) => 
        apt.status === 'CONFIRMED' || apt.status === 'COMPLETED'
      );
      
      const todayRevenue = todayConfirmed.reduce((total, apt) => {
        return total + Number(apt.service?.price || 0);
      }, 0);
      
      const todayCancelled = todayApts.filter((apt: Appointment) => 
        apt.status === 'CANCELLED'
      ).length;
      
      const activeBarberCount = barbers.filter((barber: any) => barber.isActive).length;

      setStats({
        todayBookings: todayApts.length,
        todayRevenue: todayRevenue,
        activeBarbers: activeBarberCount,
        todayCancellations: todayCancelled,
        totalAppointments: appointments.length,
      });

      // Sort today's appointments by time
      const sortedTodayApts = todayApts.sort((a, b) => 
        new Date(a.start).getTime() - new Date(b.start).getTime()
      );
      
      setTodayAppointments(sortedTodayApts.slice(0, 10)); // Show first 10

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  const statsData = [
    { 
      label: "Today's bookings", 
      value: stats.todayBookings, 
      trend: '+15%', 
      up: true 
    },
    { 
      label: "Today's revenue", 
      value: stats.todayRevenue, 
      prefix: '$', 
      trend: '+8%', 
      up: true 
    },
    { 
      label: 'Active barbers', 
      value: stats.activeBarbers, 
      trend: '', 
      up: true 
    },
    { 
      label: 'Cancellations', 
      value: stats.todayCancellations, 
      trend: '-50%', 
      up: false 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl italic">{greeting}, {user?.name?.split(' ')[0] || 'Admin'}.</h1>
        <p className="font-mono text-sm text-muted-foreground mt-1">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      {/* KPI Cards */}
      <motion.div variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((s) => <StatCard key={s.label} {...s} />)}
      </motion.div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          className="gap-2" 
          onClick={() => navigate('/admin/services')}
        >
          <Plus className="h-4 w-4" /> Add service
        </Button>
        <Button variant="outline" className="gap-2"><UserPlus className="h-4 w-4" /> Invite barber</Button>
        <Button variant="outline" className="gap-2"><Clock className="h-4 w-4" /> View schedule</Button>
      </div>

      {/* Today's Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Today's Appointments</h2>
          <Button variant="default" size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add walk-in</Button>
        </div>

        {todayAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No appointments scheduled for today.</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div variants={STAGGER} initial="hidden" animate="visible" className="space-y-2">
            {todayAppointments.map((apt) => (
              <motion.div key={apt.id} variants={FADE_UP}>
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <span className="font-mono text-sm text-muted-foreground w-12 shrink-0">
                      {format(new Date(apt.start), 'HH:mm')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{apt.customer?.name || 'Unknown Customer'}</p>
                      <p className="text-xs text-muted-foreground">{apt.service?.name || 'Unknown Service'}</p>
                    </div>
                    <div className="hidden sm:block text-sm text-muted-foreground">
                      {apt.barber?.user?.name || 'Unassigned'}
                    </div>
                    <span className={`text-[11px] font-mono px-2 py-1 rounded border ${
                      apt.status === 'CONFIRMED' ? 'border-green-300 text-green-700 bg-green-50' :
                      apt.status === 'PENDING' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                      apt.status === 'COMPLETED' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                      'border-red-300 text-red-700 bg-red-50'
                    }`}>
                      {apt.status}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

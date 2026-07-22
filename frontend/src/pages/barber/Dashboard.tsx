import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/lib/api';
import { FADE_UP, STAGGER } from '@/lib/animations';

export default function BarberDashboard() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    totalRevenue: 0,
    completedAppointments: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBarberAppointments();
      setAppointments(data);
      
      // Calculate stats
      const today = new Date().toDateString();
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      
      const todayCount = data.filter((apt: any) => 
        new Date(apt.start).toDateString() === today
      ).length;
      
      const weekCount = data.filter((apt: any) => 
        new Date(apt.start) >= weekStart
      ).length;
      
      const completedCount = data.filter((apt: any) => 
        apt.status === 'COMPLETED'
      ).length;
      
      setStats({
        todayAppointments: todayCount,
        weekAppointments: weekCount,
        totalRevenue: completedCount * 35, // Assume average $35 per service
        completedAppointments: completedCount,
      });
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      // Add API call to update appointment status
      // await apiService.updateAppointmentStatus(appointmentId, { status });
      fetchAppointments(); // Refresh data
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-secondary p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">Here's your appointment overview for today</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={STAGGER}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={FADE_UP} className="bg-background border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
                <p className="text-2xl font-bold">{stats.todayAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="bg-background border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{stats.weekAppointments}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="bg-background border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedAppointments}</p>
              </div>
              <User className="h-8 w-8 text-primary" />
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="bg-background border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
        </motion.div>

        {/* Appointments List */}
        <motion.div 
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
          className="bg-background border border-border rounded-lg"
        >
          <div className="p-6 border-b border-border">
            <h2 className="font-display text-xl font-bold">Recent Appointments</h2>
          </div>
          
          <div className="divide-y divide-border">
            {appointments.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No appointments scheduled
              </div>
            ) : (
              appointments.slice(0, 10).map((appointment: any) => (
                <div key={appointment.id} className="p-6 hover:bg-secondary transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{appointment.customer?.name || 'Customer'}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.service?.name || 'Service'} • 
                            {new Date(appointment.start).toLocaleDateString()} at {new Date(appointment.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'CONFIRMED' 
                          ? 'bg-blue-100 text-blue-800' 
                          : appointment.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                      
                      {appointment.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'COMPLETED')}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:opacity-90 transition-opacity"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {appointment.note && (
                    <p className="mt-2 text-sm text-muted-foreground italic">
                      "{appointment.note}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
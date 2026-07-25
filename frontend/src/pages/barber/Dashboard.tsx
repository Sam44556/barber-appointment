import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, User, TrendingUp, CalendarOff, CheckCircle2,
  XCircle, Loader2, AlertCircle, Phone, Scissors, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isToday } from 'date-fns';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/lib/api';
import { FADE_UP, STAGGER } from '@/lib/animations';

interface Appointment {
  id: string;
  start: string;
  end: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  note?: string;
  customer?: { name: string; email?: string; phone?: string };
  service?: { name: string; duration: number; price: number | string };
}

export default function BarberDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [updatingId, setUpdatingId]     = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateTab, setDateTab]           = useState<'today' | 'upcoming' | 'all'>('all');

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getBarberAppointments();
      setAppointments(data);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      setUpdatingId(appointmentId);
      await apiService.updateAppointmentStatus(appointmentId, { status });
      toast.success(`Appointment status updated to ${status}`);
      fetchAppointments();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update appointment status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const todayApts = appointments.filter((apt) => isToday(parseISO(apt.start)));
    const completedApts = appointments.filter((apt) => apt.status === 'COMPLETED');
    const confirmedApts = appointments.filter((apt) => apt.status === 'CONFIRMED' || apt.status === 'COMPLETED');

    const totalRevenue = confirmedApts.reduce((sum, apt) => sum + Number(apt.service?.price || 0), 0);

    return {
      todayCount: todayApts.length,
      totalCount: appointments.length,
      completedCount: completedApts.length,
      revenue: totalRevenue,
    };
  }, [appointments]);

  // Filtered appointments list
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Status filter
      if (statusFilter !== 'all' && apt.status !== statusFilter) return false;

      // Date filter
      const aptDate = parseISO(apt.start);
      if (dateTab === 'today' && !isToday(aptDate)) return false;
      if (dateTab === 'upcoming' && (isToday(aptDate) || aptDate < new Date())) return false;

      return true;
    });
  }, [appointments, statusFilter, dateTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 size={12} /> CONFIRMED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
            <XCircle size={12} /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> PENDING
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-secondary/30 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Barber Portal
            </p>
            <h1 className="font-display text-3xl font-bold">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Manage your personal appointment queue and update client statuses live
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAppointments}
              className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-sm font-body text-xs hover:bg-background transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/barber/time-off')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-body text-sm rounded-sm hover:opacity-90 transition-opacity"
            >
              <CalendarOff size={16} />
              My Time-Off
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={STAGGER}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={FADE_UP} className="bg-background border border-border rounded-sm p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase">Today's Queue</p>
                <p className="text-3xl font-bold font-display mt-1">{stats.todayCount}</p>
              </div>
              <div className="p-3 bg-secondary rounded-sm">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="bg-background border border-border rounded-sm p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase">Total Bookings</p>
                <p className="text-3xl font-bold font-display mt-1">{stats.totalCount}</p>
              </div>
              <div className="p-3 bg-secondary rounded-sm">
                <Scissors className="h-6 w-6 text-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="bg-background border border-border rounded-sm p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase">Completed Cuts</p>
                <p className="text-3xl font-bold font-display mt-1">{stats.completedCount}</p>
              </div>
              <div className="p-3 bg-secondary rounded-sm">
                <User className="h-6 w-6 text-primary" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="bg-background border border-border rounded-sm p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase">My Earnings</p>
                <p className="text-3xl font-bold font-display mt-1">${stats.revenue}</p>
              </div>
              <div className="p-3 bg-secondary rounded-sm">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Appointments List Section */}
        <motion.div
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
          className="bg-background border border-border rounded-sm shadow-sm overflow-hidden"
        >
          {/* Section Toolbar */}
          <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold">My Appointment Schedule</h2>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                Confirm, complete, or cancel appointments directly
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Tabs */}
              <div className="flex bg-secondary p-1 rounded-sm border border-border">
                {(['all', 'today', 'upcoming'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setDateTab(t)}
                    className={`px-3 py-1 font-body text-xs capitalize rounded-sm transition-colors ${
                      dateTab === t
                        ? 'bg-background font-medium shadow-xs text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-border rounded-sm font-body text-xs bg-background focus:outline-none focus:border-foreground"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          {/* List Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-muted-foreground" size={28} />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground font-body text-sm">
              <AlertCircle size={32} className="mx-auto mb-2 opacity-40" />
              No appointments found for the selected filter.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredAppointments.map((apt) => {
                const isBusy = updatingId === apt.id;
                const startDate = parseISO(apt.start);
                const endDate   = parseISO(apt.end);

                return (
                  <div
                    key={apt.id}
                    className="p-6 hover:bg-secondary/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-bold text-base">
                          {apt.customer?.name || 'Client'}
                        </p>
                        {getStatusBadge(apt.status)}
                      </div>

                      <p className="font-body text-xs text-muted-foreground flex items-center gap-2">
                        <span className="font-medium text-foreground">{apt.service?.name}</span>
                        <span>•</span>
                        <span className="font-mono">{format(startDate, 'EEE, d MMM yyyy')}</span>
                        <span>•</span>
                        <span className="font-mono">
                          {format(startDate, 'HH:mm')} – {format(endDate, 'HH:mm')}
                        </span>
                        {apt.service?.price && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-foreground font-semibold">
                              ${Number(apt.service.price)}
                            </span>
                          </>
                        )}
                      </p>

                      {apt.customer?.phone && (
                        <p className="font-mono text-xs text-muted-foreground flex items-center gap-1 pt-0.5">
                          <Phone size={12} /> {apt.customer.phone}
                        </p>
                      )}

                      {apt.note && (
                        <p className="font-body text-xs italic text-muted-foreground bg-secondary/50 p-2 rounded-sm mt-2 max-w-lg">
                          Note: "{apt.note}"
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Confirm Button */}
                      {apt.status === 'PENDING' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'CONFIRMED')}
                          disabled={isBusy}
                          className="px-3 py-1.5 bg-blue-600 text-white font-body text-xs rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {isBusy ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                          Confirm
                        </button>
                      )}

                      {/* Complete Button */}
                      {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'COMPLETED')}
                          disabled={isBusy}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-body text-xs rounded-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {isBusy ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                          Mark Complete
                        </button>
                      )}

                      {/* Cancel Button */}
                      {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'CANCELLED')}
                          disabled={isBusy}
                          className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-body text-xs rounded-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {isBusy ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                          Cancel
                        </button>
                      )}

                      {/* Select Dropdown as additional control */}
                      <select
                        value={apt.status}
                        onChange={(e) => updateAppointmentStatus(apt.id, e.target.value)}
                        disabled={isBusy}
                        className="px-2 py-1 border border-border rounded-sm font-mono text-xs bg-background focus:outline-none focus:border-foreground"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
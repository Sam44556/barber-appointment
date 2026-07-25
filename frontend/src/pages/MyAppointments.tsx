import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Clock, Scissors, User, PlusCircle,
  CheckCircle2, XCircle, AlertCircle, Loader2, Ban,
} from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { FADE_UP, STAGGER } from '@/lib/animations';

// ─── Types ────────────────────────────────────────────────────
interface Appointment {
  id: string;
  start: string;
  end: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  note?: string;
  service: { id: string; name: string; duration: number; price: string | number };
  barber: { id: string; user: { name: string; image?: string } };
}

// ─── Helpers ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   color: 'text-amber-600  bg-amber-50  border-amber-200',  Icon: AlertCircle  },
  CONFIRMED: { label: 'Confirmed', color: 'text-green-600  bg-green-50  border-green-200',  Icon: CheckCircle2 },
  COMPLETED: { label: 'Completed', color: 'text-blue-600   bg-blue-50   border-blue-200',   Icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'text-gray-400   bg-gray-50   border-gray-200',   Icon: XCircle      },
};

function StatusBadge({ status }: { status: Appointment['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-body px-2 py-1 rounded border ${cfg.color}`}>
      <cfg.Icon size={12} />
      {cfg.label}
    </span>
  );
}

// ─── Appointment Card ─────────────────────────────────────────
function AppointmentCard({
  apt,
  onCancel,
  cancelling,
}: {
  apt: Appointment;
  onCancel: (id: string) => void;
  cancelling: string | null;
}) {
  const startDate = parseISO(apt.start);
  const past      = isPast(startDate);
  const canCancel = !past && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED';

  return (
    <motion.div
      variants={FADE_UP}
      className="border border-border rounded-sm bg-background overflow-hidden"
    >
      {/* Colour accent strip based on status */}
      <div
        className={`h-1 w-full ${
          apt.status === 'CANCELLED' ? 'bg-gray-300' :
          apt.status === 'COMPLETED' ? 'bg-blue-400' :
          apt.status === 'CONFIRMED' ? 'bg-green-500' :
          'bg-amber-400'
        }`}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {apt.barber.user.image ? (
              <img
                src={apt.barber.user.image}
                alt={apt.barber.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User size={18} className="text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-display font-bold text-base leading-tight">{apt.service.name}</p>
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                with {apt.barber.user.name}
              </p>
            </div>
          </div>
          <StatusBadge status={apt.status} />
        </div>

        {/* Date / time / duration */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
            <CalendarDays size={14} className="shrink-0" />
            <span>{format(startDate, 'EEE, d MMM yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
            <Clock size={14} className="shrink-0" />
            <span>{format(startDate, 'HH:mm')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
            <Scissors size={14} className="shrink-0" />
            <span>{apt.service.duration} min</span>
          </div>
          <div className="font-display font-bold text-base">
            ${Number(apt.service.price).toFixed(2)}
          </div>
        </div>

        {/* Note */}
        {apt.note && (
          <p className="text-xs font-body text-muted-foreground italic border-t border-border pt-3 mb-4">
            "{apt.note}"
          </p>
        )}

        {/* Cancel button */}
        {canCancel && (
          <button
            onClick={() => onCancel(apt.id)}
            disabled={cancelling === apt.id}
            className="w-full flex items-center justify-center gap-2 py-2 border border-border rounded-sm font-body text-sm text-muted-foreground hover:border-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            {cancelling === apt.id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Ban size={14} />
            )}
            {cancelling === apt.id ? 'Cancelling…' : 'Cancel Appointment'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────
function EmptyState({ onBook }: { onBook: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
        <Scissors size={28} className="text-muted-foreground" />
      </div>
      <h3 className="font-display text-xl font-bold mb-2">No appointments yet</h3>
      <p className="font-body text-sm text-muted-foreground mb-8">
        You haven't booked any appointments. Ready for a fresh cut?
      </p>
      <button
        onClick={onBook}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-body text-sm rounded-sm hover:opacity-90 transition-opacity"
      >
        <PlusCircle size={16} />
        Book an Appointment
      </button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function MyAppointments() {
  const navigate              = useNavigate();
  const { isAuthenticated }   = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [cancelling, setCancelling]     = useState<string | null>(null);
  const [tab, setTab]                   = useState<'upcoming' | 'past'>('upcoming');

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view your appointments');
      navigate('/login', { state: { from: '/my-appointments' } });
    }
  }, [isAuthenticated, navigate]);

  // Fetch
  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiService.getMyAppointments();
        setAppointments(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      setCancelling(id);
      await apiService.cancelAppointment(id);
      setAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a)
      );
      toast.success('Appointment cancelled');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to cancel appointment');
    } finally {
      setCancelling(null);
    }
  };

  // Split into upcoming vs past
  const upcoming = appointments.filter(a => {
    const done = isPast(parseISO(a.start));
    return !done && a.status !== 'CANCELLED';
  });
  const past = appointments.filter(a => {
    const done = isPast(parseISO(a.start));
    return done || a.status === 'CANCELLED';
  });

  const shown = tab === 'upcoming' ? upcoming : past;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="pt-24 pb-16"
    >
      <div className="container mx-auto px-6 max-w-2xl">

        {/* Page header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Your History
            </p>
            <h1 className="font-display text-3xl font-bold">My Appointments</h1>
          </div>
          <button
            onClick={() => navigate('/book')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-body text-sm rounded-sm hover:opacity-90 transition-opacity shrink-0"
          >
            <PlusCircle size={15} />
            Book New
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          {(['upcoming', 'past'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-4 py-2.5 font-body text-sm capitalize transition-colors ${
                tab === t ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
              {t === 'upcoming' && upcoming.length > 0 && (
                <span className="ml-1.5 font-mono text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                  {upcoming.length}
                </span>
              )}
              {tab === t && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState onBook={() => navigate('/book')} />
        ) : shown.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-body text-sm">
            {tab === 'upcoming'
              ? 'No upcoming appointments. '
              : 'No past appointments yet. '}
            {tab === 'upcoming' && (
              <button
                onClick={() => navigate('/book')}
                className="underline hover:no-underline"
              >
                Book one now.
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              variants={STAGGER}
              initial="hidden"
              animate="visible"
              className="grid gap-4"
            >
              {shown.map(apt => (
                <AppointmentCard
                  key={apt.id}
                  apt={apt}
                  onCancel={handleCancel}
                  cancelling={cancelling}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

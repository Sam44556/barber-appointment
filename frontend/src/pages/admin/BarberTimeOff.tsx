import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Pencil, Loader2, CalendarOff, Clock, Store, ShieldAlert
} from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';
import { FADE_UP, STAGGER } from '@/lib/animations';

// ─── Shop Timezone & Operating Hours Constants ────────────────
const SHOP_UTC_OFFSET_HOURS = 3;

// 24h operating hours time slots (30-min intervals)
const TIME_OPTIONS = [
  '03:00', '03:30', '04:00', '04:30', '05:00', '05:30',
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

/** Convert Shop Local Date + 24h Time string (HH:mm) to UTC ISO string */
function shopTimeToUtcISO(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes]   = timeStr.split(':').map(Number);
  const utcMs = Date.UTC(year, month - 1, day, hours, minutes) - (SHOP_UTC_OFFSET_HOURS * 3600000);
  return new Date(utcMs).toISOString();
}

/** Convert UTC ISO string to Shop Local Date (YYYY-MM-DD) and 24h Time (HH:mm) */
function utcISOToShopTime(isoStr: string | null): { date: string; time: string } {
  if (!isoStr) return { date: '', time: '03:00' };
  const d = new Date(isoStr);
  const localD = new Date(d.getTime() + SHOP_UTC_OFFSET_HOURS * 3600000);
  const date = localD.toISOString().slice(0, 10);
  const time = localD.toISOString().slice(11, 16);
  return { date, time };
}

interface ShopClosure {
  id: string;
  allDay: boolean;
  start: string | null;
  end: string | null;
  reason: string | null;
  createdAt: string;
}

const hasStarted = (closure: ShopClosure) => {
  if (!closure.start) return false;
  return isPast(parseISO(closure.start));
};

// ─── Closure Modal ─────────────────────────────────────────────
function ClosureModal({
  editing,
  onClose,
  onSaved,
}: {
  editing: ShopClosure | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initialStart = utcISOToShopTime(editing?.start ?? null);
  const initialEnd   = utcISOToShopTime(editing?.end ?? null);

  const [allDay, setAllDay]       = useState(editing?.allDay ?? true);
  const [date, setDate]           = useState(initialStart.date || new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState(initialStart.time || '03:00');
  const [endTime, setEndTime]     = useState(initialEnd.time   || '20:00');
  const [reason, setReason]       = useState(editing?.reason ?? '');
  const [saving, setSaving]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('Please select a date');
      return;
    }
    if (!allDay && startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      setSaving(true);
      const startISO = allDay
        ? shopTimeToUtcISO(date, '03:00')
        : shopTimeToUtcISO(date, startTime);

      const endISO = allDay
        ? shopTimeToUtcISO(date, '20:00')
        : shopTimeToUtcISO(date, endTime);

      const payload = {
        allDay,
        start: startISO,
        end: endISO,
        reason: reason || undefined,
      };

      if (editing) {
        await apiService.updateShopClosure(editing.id, payload);
        toast.success('Shop closure updated successfully');
      } else {
        await apiService.createShopClosure(payload);
        toast.success('Shop closure added successfully');
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save shop closure');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background border border-border rounded-sm w-full max-w-md shadow-xl"
      >
        <div className="p-6 border-b border-border flex items-center gap-3">
          <Store size={20} className="text-primary" />
          <div>
            <h3 className="font-display text-lg font-bold">
              {editing ? 'Edit Shop Closure' : 'Add Shop Closure'}
            </h3>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              Shop operating hours: 03:00 – 20:00 (24h format)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setAllDay((v) => !v)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                allDay ? 'bg-primary' : 'bg-border'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                  allDay ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="font-body text-sm font-medium">Entire Day Closed (03:00 – 20:00)</span>
          </label>

          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">
              Closure Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:border-foreground"
              required
            />
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1">
                  Start Time (24h)
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-sm font-mono text-sm bg-background focus:outline-none focus:border-foreground"
                >
                  {TIME_OPTIONS.slice(0, -1).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1">
                  End Time (24h)
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-sm font-mono text-sm bg-background focus:outline-none focus:border-foreground"
                >
                  {TIME_OPTIONS.slice(1).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">
              Reason / Public Note (optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. National Holiday, Renovation, Staff Training..."
              className="w-full px-3 py-2 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:border-foreground"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-sm font-body text-sm hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-sm font-body text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? 'Update' : 'Save Closure'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Admin Component ─────────────────────────────────────
export default function AdminShopClosures() {
  const [closures, setClosures] = useState<ShopClosure[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<'create' | ShopClosure | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [tab, setTab]           = useState<'upcoming' | 'past'>('upcoming');

  const loadClosures = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getShopClosures();
      setClosures(data);
    } catch {
      toast.error('Failed to load shop closures');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClosures();
  }, [loadClosures]);

  const handleDelete = async (closure: ShopClosure) => {
    if (hasStarted(closure)) {
      toast.error('Cannot delete a closure that has already started');
      return;
    }

    if (!confirm('Are you sure you want to delete this shop closure?')) return;
    try {
      setDeleting(closure.id);
      await apiService.deleteShopClosure(closure.id);
      toast.success('Shop closure removed');
      loadClosures();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete closure');
    } finally {
      setDeleting(null);
    }
  };

  const upcoming = closures.filter((c) => !hasStarted(c));
  const past     = closures.filter((c) => hasStarted(c));
  const shown    = tab === 'upcoming' ? upcoming : past;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6">
      {/* Top Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Admin Panel
          </p>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" /> Shop Closures & Holidays
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Manage full-day or partial-hour closures for the shop using 24h format (03:00 to 20:00).
          </p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-body text-sm rounded-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Shop Closure
        </button>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-sm flex items-start gap-3">
        <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs font-body text-amber-800 space-y-1">
          <p className="font-semibold">Shop Closure Rules:</p>
          <p>
            • Time selections use 24h appointment format (03:00 to 20:00) so availability checks match perfectly.
          </p>
          <p>
            • <strong>Started Closures Policy:</strong> Closures that have already started cannot be edited or deleted.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-2.5 font-body text-sm capitalize transition-colors ${
              tab === t ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t} Closures
            {t === 'upcoming' && upcoming.length > 0 && (
              <span className="ml-1.5 font-mono text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                {upcoming.length}
              </span>
            )}
            {tab === t && (
              <motion.div
                layoutId="shop-closure-tab"
                className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center py-20 bg-background border border-border rounded-sm">
          <CalendarOff className="mx-auto mb-3 text-muted-foreground" size={36} />
          <p className="font-display font-bold text-base mb-1">
            {tab === 'upcoming' ? 'No upcoming shop closures' : 'No past shop closures'}
          </p>
          <p className="font-body text-sm text-muted-foreground">
            {tab === 'upcoming'
              ? 'The shop is open according to normal operating hours (03:00 – 20:00).'
              : 'Past closures history will appear here.'}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            variants={STAGGER}
            initial="hidden"
            animate="visible"
            className="grid gap-3"
          >
            {shown.map((c) => {
              const started = hasStarted(c);
              const { date: startDate, time: startTime } = utcISOToShopTime(c.start);
              const { time: endTime }                   = utcISOToShopTime(c.end);

              return (
                <motion.div
                  key={c.id}
                  variants={FADE_UP}
                  className={`flex items-center gap-4 p-5 border border-border rounded-sm bg-background ${
                    started ? 'opacity-70 bg-secondary/30' : 'hover:border-primary/50'
                  } transition-colors`}
                >
                  <div className="p-3 bg-secondary rounded-sm">
                    {c.allDay ? (
                      <CalendarOff size={20} className="text-primary" />
                    ) : (
                      <Clock size={20} className="text-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-bold text-base">
                        {c.allDay ? 'Full Day Shop Closure' : 'Partial Hours Closure'}
                      </span>
                      {started && (
                        <span className="text-[11px] font-mono bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                          Started / Past
                        </span>
                      )}
                    </div>
                    <p className="font-body text-xs text-muted-foreground">
                      {startDate ? format(parseISO(startDate), 'EEE, d MMM yyyy') : '—'}
                      {c.allDay ? ' (Full Day 03:00 – 20:00)' : ` • ${startTime} → ${endTime}`}
                    </p>
                    {c.reason && (
                      <p className="font-body text-xs text-muted-foreground italic mt-1">
                        "{c.reason}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModal(c)}
                      disabled={started}
                      title={started ? 'Cannot edit — closure already started' : 'Edit closure'}
                      className="p-2.5 rounded-sm border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      disabled={started || deleting === c.id}
                      title={started ? 'Cannot delete — closure already started' : 'Delete closure'}
                      className="p-2.5 rounded-sm border border-border hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {deleting === c.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <ClosureModal
            editing={modal === 'create' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={() => {
              setModal(null);
              loadClosures();
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

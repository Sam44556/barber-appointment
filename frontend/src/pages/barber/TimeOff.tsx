import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Pencil, Loader2, CalendarOff, Clock, AlertTriangle,
} from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';
import { FADE_UP, STAGGER } from '@/lib/animations';
import { useAuthStore } from '@/stores/auth';

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

interface TimeOff {
  id: string; barberId: string; allDay: boolean;
  start: string | null; end: string | null; reason: string | null; createdAt: string;
}

const hasStarted = (t: TimeOff) => !!(t.start && isPast(parseISO(t.start)));

// ─── Form modal ───────────────────────────────────────────────
function TimeOffModal({
  editing, onClose, onSaved,
}: { editing: TimeOff | null; onClose: () => void; onSaved: () => void }) {
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
    if (!date) { toast.error('Please select a date'); return; }
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
        await apiService.updateMyTimeOff(editing.id, payload);
        toast.success('Time-off updated');
      } else {
        await apiService.createMyTimeOff({ ...payload, allDay });
        toast.success('Time-off created');
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background border border-border rounded-sm w-full max-w-md shadow-xl">
        <div className="p-6 border-b border-border">
          <h3 className="font-display text-lg font-bold">{editing ? 'Edit Time-Off' : 'Request Time-Off'}</h3>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            Select date and times in 24h appointment format (03:00 to 20:00)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => setAllDay(v => !v)}
              className={`w-10 h-5 rounded-full transition-colors relative ${allDay ? 'bg-primary' : 'bg-border'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${allDay ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="font-body text-sm font-medium">All-day off (03:00 – 20:00)</span>
          </label>

          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:border-foreground"
              required />
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1">Start Time (24h)</label>
                <select value={startTime} onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-sm font-mono text-sm bg-background focus:outline-none focus:border-foreground">
                  {TIME_OPTIONS.slice(0, -1).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground block mb-1">End Time (24h)</label>
                <select value={endTime} onChange={e => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-sm font-mono text-sm bg-background focus:outline-none focus:border-foreground">
                  {TIME_OPTIONS.slice(1).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Reason (optional)</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Sick leave, personal…"
              className="w-full px-3 py-2 border border-border rounded-sm font-body text-sm bg-background focus:outline-none focus:border-foreground" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-sm font-body text-sm hover:bg-secondary transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-sm font-body text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function BarberTimeOffPage() {
  const { user }                  = useAuthStore();
  const [timeOffs, setTimeOffs]   = useState<TimeOff[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState<'create' | TimeOff | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [tab, setTab]             = useState<'upcoming' | 'past'>('upcoming');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyTimeOff();
      setTimeOffs(data);
    } catch { toast.error('Failed to load time-off records'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (t: TimeOff) => {
    if (hasStarted(t)) {
      toast.error('Cannot delete time-off that has already started');
      return;
    }

    if (!confirm('Delete this time-off?')) return;
    try {
      setDeleting(t.id);
      await apiService.deleteMyTimeOff(t.id);
      toast.success('Deleted');
      load();
    } catch (err: any) { toast.error(err?.message ?? 'Failed to delete'); }
    finally { setDeleting(null); }
  };

  const upcoming = timeOffs.filter(t => !hasStarted(t));
  const past     = timeOffs.filter(t => hasStarted(t));
  const shown    = tab === 'upcoming' ? upcoming : past;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              My Schedule
            </p>
            <h1 className="font-display text-2xl font-bold">Time-Off</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Hello {user?.name?.split(' ')[0]} — manage your personal days-off or hours-off (03:00 to 20:00).
            </p>
          </div>
          <button onClick={() => setModal('create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-body text-sm rounded-sm hover:opacity-90 transition-opacity">
            <Plus size={15} /> Add Time-Off
          </button>
        </div>

        {/* Info banner */}
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-sm flex items-start gap-2">
          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="font-body text-xs text-amber-800">
            Time-off selection matches appointment slot 24h format (03:00 to 20:00). Periods that have already <strong>started</strong> cannot be edited or deleted.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {(['upcoming', 'past'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`relative px-4 py-2.5 font-body text-sm capitalize transition-colors ${tab === t ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {t}
              {t === 'upcoming' && upcoming.length > 0 && (
                <span className="ml-1.5 font-mono text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                  {upcoming.length}
                </span>
              )}
              {tab === t && <motion.div layoutId="barber-tab" className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={28} /></div>
        ) : shown.length === 0 ? (
          <div className="text-center py-20">
            <CalendarOff className="mx-auto mb-4 text-muted-foreground" size={36} />
            <p className="font-body text-sm text-muted-foreground">
              {tab === 'upcoming' ? 'No upcoming time-off.' : 'No past time-off records.'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} variants={STAGGER} initial="hidden" animate="visible" className="grid gap-3">
              {shown.map(t => {
                const started = hasStarted(t);
                const { date: startDate, time: startTime } = utcISOToShopTime(t.start);
                const { time: endTime }                   = utcISOToShopTime(t.end);

                return (
                  <motion.div key={t.id} variants={FADE_UP}
                    className={`flex items-center gap-4 p-5 border border-border rounded-sm bg-background ${started ? 'opacity-70' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {t.allDay
                          ? <><CalendarOff size={14} className="text-muted-foreground" /><span className="font-display font-bold text-sm">Full day off</span></>
                          : <><Clock size={14} className="text-muted-foreground" /><span className="font-display font-bold text-sm">Partial hours off</span></>
                        }
                        {started && <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">Started</span>}
                      </div>
                      <p className="font-body text-xs text-muted-foreground">
                        {startDate ? format(parseISO(startDate), 'EEE, d MMM yyyy') : '—'}
                        {t.allDay ? ' (03:00 – 20:00)' : ` • ${startTime} → ${endTime}`}
                      </p>
                      {t.reason && <p className="font-body text-xs italic text-muted-foreground mt-0.5">"{t.reason}"</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setModal(t)} disabled={started}
                        title={started ? 'Cannot edit — already started' : 'Edit'}
                        className="p-2 rounded-sm hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(t)} disabled={started || deleting === t.id}
                        title={started ? 'Cannot delete — already started' : 'Delete'}
                        className="p-2 rounded-sm hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                        {deleting === t.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      <AnimatePresence>
        {modal && (
          <TimeOffModal
            editing={modal === 'create' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={() => { setModal(null); load(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

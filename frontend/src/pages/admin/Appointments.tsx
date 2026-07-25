import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FADE_UP, STAGGER } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Download, Trash2, Loader2, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface AppointmentData {
  id: string;
  start: string;
  end: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  note?: string;
  customer: { name: string; email?: string; phone?: string };
  barber: { id: string; user: { name: string } };
  service: { name: string; duration: number; price: number | string };
}

interface BarberData {
  id: string;
  user: { name: string };
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [barbers, setBarbers]           = useState<BarberData[]>([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [barberFilter, setBarberFilter] = useState<string>('all');
  const [updatingId, setUpdatingId]     = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [aptsData, barbersData] = await Promise.all([
        apiService.getAllAppointments(),
        apiService.getBarbers(),
      ]);
      setAppointments(aptsData);
      setBarbers(barbersData);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await apiService.updateAppointmentStatus(id, { status: newStatus });
      toast.success(`Appointment status updated to ${newStatus}`);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this appointment?')) return;
    try {
      setUpdatingId(id);
      await apiService.deleteAppointment(id);
      toast.success('Appointment deleted');
      fetchData();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    if (appointments.length === 0) {
      toast.error('No appointments to export');
      return;
    }
    const headers = ['ID', 'Customer', 'Customer Phone', 'Service', 'Barber', 'Date', 'Time', 'Status'];
    const rows = appointments.map((a) => [
      a.id,
      `"${a.customer?.name || 'Unknown'}"`,
      `"${a.customer?.phone || ''}"`,
      `"${a.service?.name || ''}"`,
      `"${a.barber?.user?.name || ''}"`,
      format(parseISO(a.start), 'yyyy-MM-dd'),
      format(parseISO(a.start), 'HH:mm'),
      a.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `appointments_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = appointments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (barberFilter !== 'all' && a.barber?.id !== barberFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"><CheckCircle2 size={12} /> CONFIRMED</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 size={12} /> COMPLETED</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200"><XCircle size={12} /> CANCELLED</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200"><Clock size={12} /> PENDING</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">All Appointments</h1>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            Real-time appointment records from the database
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2 font-body text-xs">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 font-body text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
            <SelectItem value="COMPLETED">COMPLETED</SelectItem>
            <SelectItem value="CANCELLED">CANCELLED</SelectItem>
          </SelectContent>
        </Select>

        <Select value={barberFilter} onValueChange={setBarberFilter}>
          <SelectTrigger className="w-48 font-body text-xs"><SelectValue placeholder="Barber" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Barbers</SelectItem>
            {barbers.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center text-xs text-muted-foreground ml-auto font-mono">
          Total: {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-sm border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-muted-foreground" size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground font-body text-sm">
              <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
              No appointments found in the database.
            </div>
          ) : (
            <motion.div variants={STAGGER} initial="hidden" animate="visible" className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/40">
                    <TableHead className="font-mono text-xs">#ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Barber</TableHead>
                    <TableHead className="font-mono text-xs">Date</TableHead>
                    <TableHead className="font-mono text-xs">Time (24h)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((apt) => {
                    const isBusy = updatingId === apt.id;
                    const dateFormatted = format(parseISO(apt.start), 'dd MMM yyyy');
                    const timeFormatted = `${format(parseISO(apt.start), 'HH:mm')} - ${format(parseISO(apt.end), 'HH:mm')}`;

                    return (
                      <motion.tr key={apt.id} variants={FADE_UP} className="border-b transition-colors hover:bg-muted/40">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {apt.id.slice(-6).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{apt.customer?.name || 'Unknown'}</p>
                            {apt.customer?.phone && (
                              <p className="font-mono text-xs text-muted-foreground">{apt.customer.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{apt.service?.name || '—'}</p>
                            {apt.service?.price && (
                              <p className="font-mono text-xs text-muted-foreground">${Number(apt.service.price)}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{apt.barber?.user?.name || '—'}</TableCell>
                        <TableCell className="font-mono text-xs">{dateFormatted}</TableCell>
                        <TableCell className="font-mono text-xs">{timeFormatted}</TableCell>
                        <TableCell>{getStatusBadge(apt.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Select
                              value={apt.status}
                              onValueChange={(val) => handleStatusChange(apt.id, val)}
                              disabled={isBusy}
                            >
                              <SelectTrigger className="h-8 w-28 text-xs font-mono">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">PENDING</SelectItem>
                                <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              onClick={() => handleDelete(apt.id)}
                              disabled={isBusy}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                              title="Delete Appointment"
                            >
                              {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FADE_UP, STAGGER } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Download, X, RefreshCw } from 'lucide-react';

const allAppointments = Array.from({ length: 20 }, (_, i) => ({
  id: `BK-${String(i + 1).padStart(3, '0')}`,
  customer: ['John Smith', 'David Lee', 'Mike Johnson', 'James Wilson', 'Robert Brown'][i % 5],
  service: ['Classic Haircut', 'Beard Trim', 'Full Package', 'Fade', 'Buzz Cut'][i % 5],
  barber: ['Marcus Chen', 'Alex Rivera', 'DeShawn Williams'][i % 3],
  date: '2025-04-14',
  time: `${9 + (i % 9)}:${i % 2 === 0 ? '00' : '30'}`,
  status: (['Confirmed', 'Completed', 'Cancelled'] as const)[i % 3],
}));

const AdminAppointments = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [barberFilter, setBarberFilter] = useState('all');

  const filtered = allAppointments.filter((a) => {
    if (statusFilter !== 'all' && a.status.toLowerCase() !== statusFilter) return false;
    if (barberFilter !== 'all' && a.barber !== barberFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl">All Appointments</h1>
        <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={barberFilter} onValueChange={setBarberFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Barber" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All barbers</SelectItem>
            <SelectItem value="Marcus Chen">Marcus Chen</SelectItem>
            <SelectItem value="Alex Rivera">Alex Rivera</SelectItem>
            <SelectItem value="DeShawn Williams">DeShawn Williams</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <motion.div variants={STAGGER} initial="hidden" animate="visible">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs">#ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Barber</TableHead>
                  <TableHead className="font-mono text-xs">Date</TableHead>
                  <TableHead className="font-mono text-xs">Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((apt) => (
                  <motion.tr key={apt.id} variants={FADE_UP} className="border-b transition-colors hover:bg-muted/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">{apt.id}</TableCell>
                    <TableCell className="font-medium">{apt.customer}</TableCell>
                    <TableCell>{apt.service}</TableCell>
                    <TableCell>{apt.barber}</TableCell>
                    <TableCell className="font-mono text-xs">{apt.date}</TableCell>
                    <TableCell className="font-mono text-xs">{apt.time}</TableCell>
                    <TableCell>
                      <span className="text-[11px] font-mono px-2 py-1 rounded border border-border">{apt.status}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><RefreshCw className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><X className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <p className="font-mono text-xs text-muted-foreground">Page 1 of 1</p>
      </div>
    </div>
  );
};

export default AdminAppointments;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FADE_UP } from '@/lib/animations';
import { barbers } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

const hours = Array.from({ length: 10 }, (_, i) => `${9 + i}:00`);

// Mock booked slots per barber
const bookedSlots: Record<string, Record<string, { customer: string; service: string }>> = {
  '1': { '9:00': { customer: 'John S.', service: 'Haircut' }, '11:00': { customer: 'Mike J.', service: 'Fade' }, '14:00': { customer: 'Chris D.', service: 'Shave' } },
  '2': { '10:00': { customer: 'David L.', service: 'Classic Cut' }, '13:00': { customer: 'Robert B.', service: 'Buzz Cut' } },
  '3': { '9:00': { customer: 'James W.', service: 'Beard Trim' }, '15:00': { customer: 'Tom R.', service: 'Full Package' } },
};

const AdminSchedule = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 1 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Schedule</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>Today</Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((w) => w + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="font-mono text-sm text-muted-foreground">
        {format(weekStart, 'd MMM')} — {format(addDays(weekStart, 6), 'd MMM yyyy')}
      </p>

      <motion.div variants={FADE_UP} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-mono text-xs text-muted-foreground w-20">Time</th>
                  {barbers.map((b) => (
                    <th key={b.id} className="p-3 text-left">
                      <div className="flex items-center gap-2">
                        <img src={b.avatarUrl} alt={b.name} className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-sm font-medium">{b.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour) => (
                  <tr key={hour} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs text-muted-foreground">{hour}</td>
                    {barbers.map((b) => {
                      const slot = bookedSlots[b.id]?.[hour];
                      return (
                        <td key={b.id} className="p-2">
                          {slot ? (
                            <div className="bg-foreground text-background rounded-md px-3 py-2 text-xs">
                              <p className="font-medium">{slot.customer}</p>
                              <p className="opacity-70">{slot.service}</p>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground/50 px-3 py-2">Available</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminSchedule;

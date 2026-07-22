import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';
import { format } from 'date-fns';
import { EASE } from '@/lib/animations';
import type { Appointment } from '@/types';

export default function BookingConfirmation() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const fetchAppointment = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await apiService.getAppointment(id);
      setAppointment(data);
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      toast.error('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const copyRef = () => {
    if (id) {
      navigator.clipboard.writeText(id);
      toast.success('Reference copied!');
    }
  };

  const addToCalendar = () => {
    if (!appointment) return;
    
    const startDate = new Date(appointment.start);
    const endDate = new Date(appointment.end);
    
    const title = encodeURIComponent(`${appointment.service.name} - Fade Cut Barbershop`);
    const details = encodeURIComponent(`Service: ${appointment.service.name}\nBarber: ${appointment.barber.user.name}\nLocation: Fade Cut Barbershop`);
    const location = encodeURIComponent('Fade Cut Barbershop');
    
    const startTime = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endTime = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
    
    window.open(calendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-lg">
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-lg text-center">
          <h1 className="font-display text-3xl mb-4">Appointment Not Found</h1>
          <p className="text-muted-foreground mb-8">We couldn't find the appointment you're looking for.</p>
          <Link
            to="/book"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
          >
            Book New Appointment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-24 pb-16"
    >
      <div className="container mx-auto px-6 max-w-lg text-center">
        <motion.svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          className="mx-auto mb-8"
        >
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
          />
          <motion.path
            d="M24 40 L35 51 L56 30"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.5, ease: EASE }}
          />
        </motion.svg>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="font-display text-4xl lg:text-5xl italic mb-4"
        >
          You're booked.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={copyRef}
            className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            #{appointment.id} <Copy size={14} />
          </button>

          <div className="bg-gray-900 text-primary-foreground rounded-sm p-6 text-left mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                {appointment.barber.user.image ? (
                  <img 
                    src={appointment.barber.user.image} 
                    alt={appointment.barber.user.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User size={24} className="text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-display text-lg font-bold">{appointment.service.name}</p>
                <p className="font-body text-sm text-gray-400">
                  with {appointment.barber.user.name}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <p className="font-display text-lg">{format(new Date(appointment.start), 'EEEE, d MMMM yyyy')}</p>
              <p className="font-mono text-xl font-bold mt-1">{format(new Date(appointment.start), 'HH:mm')}</p>
            </div>
            <div className="border-t border-gray-700 mt-4 pt-4 flex justify-between items-center">
              <span className="font-body text-sm text-gray-400">{appointment.service.duration} min</span>
              <span className="font-display text-2xl font-bold">${appointment.service.price}</span>
            </div>
            {appointment.note && (
              <div className="border-t border-gray-700 mt-4 pt-4">
                <p className="text-sm text-gray-400 italic">"{appointment.note}"</p>
              </div>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-sm p-4 mb-8">
            <p className="text-green-800 text-sm">
              <strong>Confirmation sent!</strong> We've sent appointment details to your phone and email.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={addToCalendar}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-sm font-body text-sm hover:bg-secondary transition-colors"
            >
              <Calendar size={16} /> Add to Calendar
            </button>
            <Link
              to="/book"
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 py-3"
            >
              Book another
            </Link>
          </div>

          <div className="mt-8 text-xs text-muted-foreground">
            <p>Need to reschedule or cancel?</p>
            <p>Call us at <a href="tel:+1234567890" className="underline">(123) 456-7890</a> at least 2 hours before your appointment.</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

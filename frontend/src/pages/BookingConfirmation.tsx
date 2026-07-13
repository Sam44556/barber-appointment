import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useBookingStore } from '@/stores/booking';
import { format } from 'date-fns';
import { EASE } from '@/lib/animations';

export default function BookingConfirmation() {
  const { id } = useParams();
  const { selectedService, selectedBarber, selectedDate, selectedTime } = useBookingStore();

  const copyRef = () => {
    if (id) {
      navigator.clipboard.writeText(id);
      toast.success('Reference copied!');
    }
  };

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
            #{id} <Copy size={14} />
          </button>

          {selectedService && (
            <div className="bg-gray-900 text-primary-foreground rounded-sm p-6 text-left mb-8">
              <div className="flex items-center gap-4 mb-4">
                {selectedBarber && (
                  <img src={selectedBarber.avatarUrl} alt={selectedBarber.name} className="w-12 h-12 rounded-full object-cover" />
                )}
                <div>
                  <p className="font-display text-lg font-bold">{selectedService.name}</p>
                  <p className="font-body text-sm text-gray-400">
                    {selectedBarber ? `with ${selectedBarber.name}` : 'Any barber'}
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-4">
                {selectedDate && (
                  <p className="font-display text-lg">{format(selectedDate, 'EEEE, d MMMM yyyy')}</p>
                )}
                <p className="font-mono text-xl font-bold mt-1">{selectedTime}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-sm font-body text-sm hover:bg-secondary transition-colors"
            >
              <Calendar size={16} /> Add to Calendar
            </a>
            <Link
              to="/book"
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 py-3"
            >
              Book another
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

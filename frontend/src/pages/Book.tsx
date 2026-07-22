import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Lock, User } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { FADE_UP, STAGGER, EASE } from '@/lib/animations';
import { useBookingStore } from '@/stores/booking';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import type { Service, Barber, TimeSlot } from '@/types';

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-12">
      {[
        { num: 1, label: 'Service' },
        { num: 2, label: 'Time' },
        { num: 3, label: 'Confirm' },
      ].map((s, i) => (
        <div key={s.num} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono transition-colors ${
              step > s.num
                ? 'bg-primary text-primary-foreground'
                : step === s.num
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-muted-foreground'
            }`}
          >
            {step > s.num ? <Check size={14} /> : s.num}
          </div>
          <span className={`font-body text-xs hidden sm:block ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
            {s.label}
          </span>
          {i < 2 && (
            <div className="w-12 sm:w-20 h-px mx-2">
              <motion.div
                className="h-full bg-primary origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: step > s.num ? 1 : 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              />
              <div className="h-px bg-border -mt-px" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Step1() {
  const { selectedService, selectedBarber, setService, setBarber, setStep } = useBookingStore();
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, barbersData] = await Promise.all([
          apiService.getServices(),
          apiService.getBarbers(),
        ]);
        
        setServices(servicesData.filter((service: Service) => service.isActive));
        setBarbers(barbersData.filter((barber: Barber) => barber.isActive));
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load services and barbers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display text-2xl font-bold mb-2">Choose your service</h2>
      <p className="font-body text-sm text-muted-foreground mb-8">Select what you're looking for today.</p>

      <motion.div variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {services.map((service) => {
          const isSelected = selectedService?.id === service.id;
          return (
            <motion.button
              key={service.id}
              variants={FADE_UP}
              whileTap={{ scale: 0.97 }}
              onClick={() => setService(service)}
              className={`relative text-left p-5 border rounded-sm transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-foreground'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <Check size={16} />
                </div>
              )}
              <h3 className="font-display text-lg font-bold">{service.name}</h3>
              <p className={`font-body text-sm mt-1 ${isSelected ? 'text-gray-300' : 'text-muted-foreground'}`}>
                {service.description || 'Professional service'}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <span className={`font-mono text-xs ${isSelected ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  {service.duration} min
                </span>
                <span className="font-display font-bold">${service.price}</span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <h2 className="font-display text-2xl font-bold mb-2">Choose your barber</h2>
      <p className="font-body text-sm text-muted-foreground mb-6">Or let us pick the best available.</p>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        <button
          onClick={() => setBarber(null)}
          className={`shrink-0 flex flex-col items-center gap-2 p-3 rounded-sm transition-all ${
            selectedBarber === null ? 'ring-2 ring-primary' : ''
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <span className="font-body text-xs text-muted-foreground">Any</span>
          </div>
          <span className="font-body text-xs">No pref.</span>
        </button>

        {barbers.map((barber) => (
          <button
            key={barber.id}
            onClick={() => setBarber(barber)}
            className={`shrink-0 flex flex-col items-center gap-2 p-3 rounded-sm transition-all ${
              selectedBarber?.id === barber.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
              {barber.user.image ? (
                <img
                  src={barber.user.image}
                  alt={barber.user.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <User size={24} className="text-muted-foreground" />
              )}
            </div>
            <span className="font-body text-xs">{barber.user.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => selectedService && setStep(2)}
        disabled={!selectedService}
        className="w-full mt-10 py-4 bg-primary text-primary-foreground font-body text-sm rounded-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        Continue
      </button>
    </motion.div>
  );
}

function Step2() {
  const { selectedDate, selectedTime, selectedBarber, setDate, setTime, setStep } = useBookingStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOffset = getDay(startOfMonth(currentMonth));

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (!selectedDate) return;

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        
        if (selectedBarber) {
          // Get availability for specific barber
          const slots = await apiService.getBarberAvailability(selectedBarber.id, dateString);
          setAvailableSlots(slots);
        } else {
          // For "any barber", we'll use a simplified approach
          // In a real app, you'd fetch availability across all barbers
          const defaultSlots: TimeSlot[] = [];
          for (let hour = 9; hour <= 17; hour++) {
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            defaultSlots.push({
              time: timeString,
              datetime: `${dateString}T${timeString}:00.000Z`,
              available: Math.random() > 0.3, // 70% chance of being available
            });
          }
          setAvailableSlots(defaultSlots);
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
        toast.error('Failed to load availability');
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, selectedBarber]);

  const groupedSlots = useMemo(() => {
    const groups: Record<string, TimeSlot[]> = {
      'Morning': availableSlots.filter(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        return hour >= 9 && hour < 12;
      }),
      'Afternoon': availableSlots.filter(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        return hour >= 12 && hour < 17;
      }),
      'Evening': availableSlots.filter(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        return hour >= 17;
      }),
    };
    
    // Remove empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, slots]) => slots.length > 0)
    );
  }, [availableSlots]);

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <button onClick={() => setStep(1)} className="font-body text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
        <ChevronLeft size={14} /> Back
      </button>

      <h2 className="font-display text-2xl font-bold mb-8">Pick a date & time</h2>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-secondary rounded-sm">
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-display text-lg">{format(currentMonth, 'MMMM yyyy')}</h3>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-secondary rounded-sm">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="font-mono text-[11px] text-muted-foreground text-center py-2">{d}</div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={format(currentMonth, 'yyyy-MM')}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7 gap-1"
          >
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const isSunday = getDay(day) === 0;
              const isPast = isBefore(day, startOfDay(new Date())) && !isToday(day);
              const isDisabled = isSunday || isPast;
              const selected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !isDisabled && setDate(day)}
                  disabled={isDisabled}
                  className={`h-11 rounded-sm font-body text-sm transition-all ${
                    selected
                      ? 'bg-primary text-primary-foreground'
                      : isDisabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'hover:bg-secondary'
                  } ${isToday(day) && !selected ? 'underline underline-offset-4' : ''}`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="font-body text-sm text-muted-foreground mb-4">
              Available times for <span className="text-foreground font-medium">{format(selectedDate, 'EEEE, d MMMM')}</span>
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : Object.entries(groupedSlots).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No available slots for this date.</p>
                <p className="text-xs mt-1">Please select a different date.</p>
              </div>
            ) : (
              Object.entries(groupedSlots).map(([period, slots]) => (
                <div key={period} className="mb-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">{period}</p>
                  <motion.div variants={STAGGER} initial="hidden" animate="visible" className="flex flex-wrap gap-2">
                    {slots.map((slot) => {
                      const isBooked = !slot.available;
                      const isSelected = selectedTime === slot.time;
                      return (
                        <motion.button
                          key={slot.time}
                          variants={FADE_UP}
                          onClick={() => slot.available && setTime(slot.time)}
                          disabled={isBooked}
                          className={`font-mono text-sm px-4 py-2.5 border rounded-full transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : isBooked
                              ? 'bg-secondary text-gray-300 line-through cursor-not-allowed border-transparent'
                              : 'border-border hover:border-foreground'
                          }`}
                        >
                          {slot.time}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>
              ))
            )}

            <button
              onClick={() => selectedTime && setStep(3)}
              disabled={!selectedTime}
              className="w-full mt-6 py-4 bg-primary text-primary-foreground font-body text-sm rounded-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Step3() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    selectedService, selectedBarber, selectedDate, selectedTime,
    customerName, customerPhone, customerEmail,
    setStep, setCustomerDetails, reset,
  } = useBookingStore();
  
  const [name, setName] = useState(customerName || user?.name || '');
  const [phone, setPhone] = useState(customerPhone || user?.phone || '');
  const [email, setEmail] = useState(customerEmail || user?.email || '');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !name || !phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to book an appointment');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create appointment data
      const appointmentData = {
        serviceId: selectedService.id,
        barberId: selectedBarber?.id || '', // If no barber selected, backend should handle assignment
        start: `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00.000Z`,
        note: note || undefined,
      };

      const appointment = await apiService.createAppointment(appointmentData);
      
      // Store customer details for confirmation
      setCustomerDetails(name, phone, email);
      
      toast.success('Appointment booked successfully!');
      navigate(`/booking/confirmation/${appointment.id}`);
      
      // Reset booking store
      reset();
      
    } catch (error: any) {
      console.error('Failed to create appointment:', error);
      toast.error(error.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <button onClick={() => setStep(2)} className="font-body text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
        <ChevronLeft size={14} /> Back
      </button>

      <h2 className="font-display text-2xl font-bold mb-8">Confirm your booking</h2>

      <div className="bg-gray-900 text-primary-foreground rounded-sm p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          {selectedBarber && (
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
              {selectedBarber.user.image ? (
                <img 
                  src={selectedBarber.user.image} 
                  alt={selectedBarber.user.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User size={24} className="text-muted-foreground" />
              )}
            </div>
          )}
          <div>
            <p className="font-display text-lg font-bold">{selectedService?.name}</p>
            <p className="font-body text-sm text-gray-400">
              {selectedBarber ? `with ${selectedBarber.user.name}` : 'Any available barber'}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          {selectedDate && (
            <p className="font-display text-lg">{format(selectedDate, 'EEEE, d MMMM yyyy')}</p>
          )}
          <p className="font-mono text-xl font-bold">{selectedTime}</p>
        </div>
        <div className="border-t border-gray-700 mt-4 pt-4 flex justify-between items-center">
          <span className="font-body text-sm text-gray-400">{selectedService?.duration} min</span>
          <span className="font-display text-2xl font-bold">${selectedService?.price}</span>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            You need to be logged in to book an appointment. 
            <button 
              onClick={() => navigate('/login')}
              className="underline ml-1 hover:no-underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      )}

      <div className="space-y-4 mb-8">
        <div>
          <label className="font-body text-sm font-medium block mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={isSubmitting}
            className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
          />
        </div>
        <div>
          <label className="font-body text-sm font-medium block mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            disabled={isSubmitting}
            className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
          />
        </div>
        <div>
          <label className="font-body text-sm font-medium block mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            disabled={isSubmitting}
            className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
          />
        </div>
        <div>
          <label className="font-body text-sm font-medium block mb-1.5">Special requests (Optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any special instructions or preferences..."
            rows={3}
            disabled={isSubmitting}
            className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors disabled:opacity-50 resize-none"
          />
        </div>
        <p className="font-body text-xs text-muted-foreground">We'll send a confirmation to your phone and email.</p>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!name || !phone || isSubmitting || !isAuthenticated}
        className="w-full py-4 bg-primary text-primary-foreground font-body text-sm rounded-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
            Booking Appointment...
          </>
        ) : (
          'Confirm Appointment'
        )}
      </button>

      <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
        <Lock size={12} />
        <span className="font-body text-xs">Free cancellation up to 2 hours before</span>
      </div>
    </motion.div>
  );
}

export default function Book() {
  const { step } = useBookingStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5 }}
      className="pt-24 pb-16"
    >
      <div className="container mx-auto px-6 max-w-xl">
        <StepIndicator step={step} />
        <AnimatePresence mode="wait">
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

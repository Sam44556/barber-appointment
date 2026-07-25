import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Lock, User, Store, CalendarOff, AlertTriangle, UserX } from 'lucide-react';
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
          className={`shrink-0 flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
            selectedBarber === null
              ? 'border-primary bg-primary/5 ring-2 ring-primary shadow-sm'
              : 'border-border bg-background hover:border-foreground/40'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center font-display font-bold text-xs text-muted-foreground">
            Any
          </div>
          <div className="text-center">
            <span className="font-body text-xs font-medium block">No Preference</span>
            <span className="font-mono text-[10px] text-muted-foreground block">First available</span>
          </div>
        </button>

        {barbers.map((barber) => {
          const isSelected = selectedBarber?.id === barber.id;
          const avatarUrl = barber.user?.image || barber.photo;
          const barberName = barber.user?.name || barber.name || 'Barber';
          const spec = barber.specializations || 'Barber';

          return (
            <button
              key={barber.id}
              onClick={() => setBarber(barber)}
              className={`shrink-0 flex flex-col items-center gap-2 p-3 rounded-lg border transition-all max-w-36 ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary shadow-sm'
                  : 'border-border bg-background hover:border-foreground/40'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border shadow-sm shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={barberName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="font-display font-bold text-base text-primary">
                    {barberName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-center w-full">
                <span className="font-body text-xs font-semibold block truncate">{barberName}</span>
                <span className="font-body text-[10px] text-muted-foreground block truncate">{spec}</span>
              </div>
            </button>
          );
        })}
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
  const { selectedDate, selectedTime, selectedBarber, selectedService, setDate, setTime, setStep, setAvailableSlots } = useBookingStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setLocalAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOffset = getDay(startOfMonth(currentMonth));

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (!selectedDate || !selectedService) {
      console.log('⏭️ Skipping availability fetch - missing date or service');
      return;
    }

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        
        console.log('🔄 Fetching availability for:', {
          date: dateString,
          service: selectedService.name,
          serviceId: selectedService.id,
          serviceDuration: selectedService.duration,
          barber: selectedBarber ? selectedBarber.user.name : 'Any barber',
          barberId: selectedBarber?.id,
        });
        
        // Call the backend availability API 
        const slots = await apiService.getAvailability(
          dateString,
          selectedService.id,
          selectedBarber?.id
        );
        
        console.log('✅ Backend availability response:', {
          totalSlots: slots.length,
          availableSlots: slots.filter(s => s.available).length,
          unavailableSlots: slots.filter(s => !s.available).length,
        });
        
        // Backend already determined availability - just use it directly
        setLocalAvailableSlots(slots);
        setAvailableSlots(slots); // Store in global state for Step3
        
      } catch (error) {
        console.error('❌ Failed to fetch availability:', error);
        
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
        }
        
        // Show the user a helpful error message
        if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
          toast.error('Please login to view availability');
        } else if (error.message?.includes('404')) {
          toast.error('Availability service not found. Please try again later.');
        } else {
          toast.error(`Failed to load availability: ${error.message || 'Unknown error'}`);
        }
        
        setLocalAvailableSlots([]);
        setAvailableSlots([]); // Clear global state too
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, selectedBarber, selectedService, setAvailableSlots]);

  const groupedSlots = useMemo(() => {
    console.log('🔢 Processing slots from backend:', availableSlots.length, 'total slots');
    
    if (!availableSlots || availableSlots.length === 0) {
      console.log('⚠️ No slots to process');
      return {};
    }
    
    // Log what we received from backend for debugging
    console.log('📋 Backend slots sample:', availableSlots.slice(0, 5).map(s => ({
      time: s.time,
      available: s.available,
      reason: s.reason,
      barberName: s.barberName
    })));
    
    // Group slots by time period based on hour
    // Morning: 03:00–13:00, Afternoon: 14:00–20:00  (matches backend)
    const groups: Record<string, TimeSlot[]> = {};

    const morningSlots = availableSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 3 && hour < 13; // Morning period
    });

    const afternoonSlots = availableSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 14 && hour < 20; // Afternoon period
    });

    if (morningSlots.length > 0) {
      groups['Morning (03:00 - 13:00)'] = morningSlots;
    }

    if (afternoonSlots.length > 0) {
      groups['Afternoon (14:00 - 20:00)'] = afternoonSlots;
    }

    console.log('📊 Grouped slots:', {
      morning: morningSlots.length,
      afternoon: afternoonSlots.length,
      availableMorning: morningSlots.filter(s => s.available).length,
      availableAfternoon: afternoonSlots.filter(s => s.available).length
    });

    return groups;
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
            <p className="font-body text-sm text-muted-foreground mb-4 flex items-center gap-2">
              Available times for <span className="text-foreground font-medium">{format(selectedDate, 'EEEE, d MMMM')}</span>
              {selectedService && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {selectedService.duration} min service
                </span>
              )}
              {loading && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded flex items-center gap-1">
                  <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </span>
              )}
            </p>
            
            {/* Shop hours info */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-sm">
              <p className="text-xs text-blue-800">
                <strong>Shop Hours:</strong> Morning 03:00–13:00 • Afternoon 14:00–20:00 • Lunch Break 13:00–14:00
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : availableSlots.length > 0 && availableSlots.every(s => !s.available) ? (() => {
              const firstReason = (availableSlots[0]?.reason || '').toLowerCase();
              const isShopClosed = firstReason.includes('shop') || firstReason.includes('holiday') || (!selectedBarber && firstReason.includes('closed'));

              if (isShopClosed) {
                return (
                  <div className="p-6 bg-red-50 border border-red-200 rounded-sm text-center my-4">
                    <Store className="h-10 w-10 text-red-500 mx-auto mb-2" />
                    <h4 className="font-display font-bold text-lg text-red-900 mb-1">
                      Shop is Closed Today
                    </h4>
                    <p className="font-body text-sm text-red-700">
                      {availableSlots[0]?.reason || 'The barbershop is closed on this date.'}
                    </p>
                    <p className="font-body text-xs text-red-600 mt-2">
                      Please select another date on the calendar above to view available booking slots.
                    </p>
                  </div>
                );
              }

              return (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-sm text-center my-4">
                  <UserX className="h-10 w-10 text-amber-600 mx-auto mb-2" />
                  <h4 className="font-display font-bold text-lg text-amber-900 mb-1">
                    {selectedBarber ? `${selectedBarber.user.name} is Off Today` : 'No Barbers Available Today'}
                  </h4>
                  <p className="font-body text-sm text-amber-800">
                    {availableSlots[0]?.reason || 'Barber is off on this date.'}
                  </p>
                  <p className="font-body text-xs text-amber-700 mt-2">
                    {selectedBarber 
                      ? 'Try selecting another date or click "Back" to choose "Any barber".' 
                      : 'Please select another date on the calendar above.'}
                  </p>
                </div>
              );
            })() : Object.entries(groupedSlots).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No available slots for this date.</p>
                {selectedBarber ? (
                  <p className="text-xs mt-1">
                    {selectedBarber.user.name} is not available today. Try selecting a different date or choose "Any barber".
                  </p>
                ) : (
                  <p className="text-xs mt-1">
                    No barbers are available today. Please select a different date.
                  </p>
                )}
              </div>
            ) : (
              Object.entries(groupedSlots).map(([period, slots]) => (
                <div key={period} className="mb-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">{period}</p>
                  <motion.div variants={STAGGER} initial="hidden" animate="visible" className="flex flex-wrap gap-2">
                    {slots.map((slot) => {
                      const isUnavailable = !slot.available;
                      const isSelected = selectedTime === slot.time;
                      return (
                        <motion.button
                          key={slot.time}
                          variants={FADE_UP}
                          onClick={() => {
                            if (slot.available) {
                              setTime(slot.time);
                            } else {
                              // Show why it's not available
                              toast.error(`${slot.time} is not available: ${slot.reason || 'Time slot taken'}`);
                            }
                          }}
                          disabled={!slot.available}
                          className={`relative font-mono text-sm px-4 py-2.5 border rounded-sm transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-md'
                              : !slot.available
                              ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200 opacity-50 blur-[0.5px]'
                              : 'border-border hover:border-foreground hover:bg-secondary hover:shadow-sm'
                          }`}
                          title={
                            !slot.available 
                              ? `❌ ${slot.reason || 'Not available'}`
                              : selectedBarber 
                                ? `✅ Available with ${selectedBarber.user.name}`
                                : slot.barberName 
                                  ? `✅ Available with ${slot.barberName}`
                                  : '✅ Available - Click to select'
                          }
                        >
                          <div className="flex flex-col items-center">
                            <span className={!slot.available ? 'line-through opacity-60' : ''}>{slot.time}</span>
                            
                            {/* Show barber name if available and not specific barber selected */}
                            {!selectedBarber && slot.barberName && slot.available && (
                              <span className="text-xs text-muted-foreground mt-0.5">
                                {slot.barberName.split(' ')[0]}
                              </span>
                            )}
                            
                            {/* Show reason for unavailability */}
                            {!slot.available && slot.reason && (
                              <span className="text-xs text-red-500 mt-0.5 truncate max-w-20">
                                {slot.reason === 'Already booked' ? '🚫 Taken' :
                                 slot.reason === 'Barber is off during this time' ? '🚫 Off' :
                                 slot.reason === 'Shop closed during this time' ? '🚫 Closed' :
                                 slot.reason === 'All barbers unavailable' ? '🚫 Full' :
                                 '🚫 N/A'}
                              </span>
                            )}
                          </div>
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
    setStep, reset,
  } = useBookingStore();
  
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Missing booking information');
      return;
    }

    if (!isAuthenticated || !user) {
      toast.error('Please login to book an appointment');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Find the selected time slot — we need its datetime (correct UTC) and optional barber
      const { availableSlots } = useBookingStore.getState();
      const selectedSlot = availableSlots.find(slot => slot.time === selectedTime);

      let finalBarberId = selectedBarber?.id;
      if (!finalBarberId && selectedSlot?.barberId) {
        finalBarberId = selectedSlot.barberId;
        console.log('📋 Auto-assigned barber from availability:', selectedSlot.barberName);
      }

      // Use the datetime returned by the backend — it is already correctly converted to UTC.
      // Do NOT reconstruct as `${date}T${time}:00.000Z` because that wrongly treats
      // local time as UTC (causes a +3h shift when stored/displayed).
      const startUTC = selectedSlot?.datetime
        ?? `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00.000Z`; // fallback only

      console.log('🕐 Slot local time:', selectedTime, '→ UTC stored as:', startUTC);

      // Create appointment data
      const appointmentData = {
        serviceId: selectedService.id,
        barberId: finalBarberId || '',
        start: startUTC,
        note: note || undefined,
      };

      console.log('📝 Creating appointment with data:', appointmentData);
      const appointment = await apiService.createAppointment(appointmentData);
      
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

      {/* Customer Info Display (Read-Only) */}
      <div className="bg-muted rounded-sm p-6 mb-6">
        <h3 className="font-display text-lg font-bold mb-4">Booking Details</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          {user?.phone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{user.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Optional Note */}
      <div className="mb-8">
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

      <button
        onClick={handleConfirm}
        disabled={isSubmitting || !isAuthenticated}
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
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login first to book an appointment');
      navigate('/login', { 
        state: { 
          from: '/book',
          message: 'Please login to continue with your booking'
        }
      });
    }
  }, [isAuthenticated, navigate]);

  // Don't render booking content if not authenticated
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.5 }}
        className="pt-24 pb-16"
      >
        <div className="container mx-auto px-6 max-w-xl text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <Lock className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-4 text-yellow-800">Login Required</h2>
            <p className="text-yellow-700 mb-6">
              You need to be logged in to book an appointment. Please sign in to continue.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/login', { 
                  state: { 
                    from: '/book',
                    message: 'Please login to continue with your booking'
                  }
                })}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register', { 
                  state: { 
                    from: '/book',
                    message: 'Create an account to book appointments'
                  }
                })}
                className="px-6 py-3 border border-primary text-primary rounded-sm hover:bg-primary/10 transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

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

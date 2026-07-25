import { create } from 'zustand';
import type { Service, Barber } from '@/types';

interface TimeSlot {
  time: string;
  datetime: string;
  available: boolean;
  barberId?: string;
  barberName?: string;
  reason?: string;
}

interface BookingStore {
  step: 1 | 2 | 3;
  selectedService: Service | null;
  selectedBarber: Barber | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  availableSlots: TimeSlot[];
  setStep: (step: 1 | 2 | 3) => void;
  setService: (service: Service) => void;
  setBarber: (barber: Barber | null) => void;
  setDate: (date: Date) => void;
  setTime: (time: string) => void;
  setAvailableSlots: (slots: TimeSlot[]) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  step: 1,
  selectedService: null,
  selectedBarber: null,
  selectedDate: null,
  selectedTime: null,
  availableSlots: [],
  setStep: (step) => set({ step }),
  setService: (selectedService) => set({ selectedService }),
  setBarber: (selectedBarber) => set({ selectedBarber }),
  setDate: (selectedDate) => set({ selectedDate }),
  setTime: (selectedTime) => set({ selectedTime }),
  setAvailableSlots: (availableSlots) => set({ availableSlots }),
  reset: () =>
    set({
      step: 1,
      selectedService: null,
      selectedBarber: null,
      selectedDate: null,
      selectedTime: null,
      availableSlots: [],
    }),
}));

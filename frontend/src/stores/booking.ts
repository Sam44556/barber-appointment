import { create } from 'zustand';
import type { Service, Barber } from '@/types';

interface BookingStore {
  step: 1 | 2 | 3;
  selectedService: Service | null;
  selectedBarber: Barber | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  setStep: (step: 1 | 2 | 3) => void;
  setService: (service: Service) => void;
  setBarber: (barber: Barber | null) => void;
  setDate: (date: Date) => void;
  setTime: (time: string) => void;
  setCustomerDetails: (name: string, phone: string, email: string) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  step: 1,
  selectedService: null,
  selectedBarber: null,
  selectedDate: null,
  selectedTime: null,
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  setStep: (step) => set({ step }),
  setService: (selectedService) => set({ selectedService }),
  setBarber: (selectedBarber) => set({ selectedBarber }),
  setDate: (selectedDate) => set({ selectedDate }),
  setTime: (selectedTime) => set({ selectedTime }),
  setCustomerDetails: (customerName, customerPhone, customerEmail) =>
    set({ customerName, customerPhone, customerEmail }),
  reset: () =>
    set({
      step: 1,
      selectedService: null,
      selectedBarber: null,
      selectedDate: null,
      selectedTime: null,
      customerName: '',
      customerPhone: '',
      customerEmail: '',
    }),
}));

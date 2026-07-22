export type Role = 'CUSTOMER' | 'BARBER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
  phone?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number; // decimal
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Barber {
  id: string;
  userId: string;
  user: User;
  isActive: boolean;
  specializations?: string;
  appointments?: Appointment[];
  timeOff?: BarberTimeOff[];
  createdAt: string;
  updatedAt: string;
}

export interface BarberTimeOff {
  id: string;
  barberId: string;
  barber: Barber;
  allDay: boolean;
  start?: string;
  end?: string;
  reason?: string;
  createdAt: string;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  customerId: string;
  customer: User;
  barberId: string;
  barber: Barber;
  serviceId: string;
  service: Service;
  start: string;
  end: string;
  status: AppointmentStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  time: string; // "14:30"
  datetime: string; // ISO string
  available: boolean;
}

export interface BookingData {
  barberId: string;
  serviceId: string;
  start: string;
  note?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  avatarUrl: string;
  bio?: string;
}

export interface Appointment {
  id: string;
  service: Service;
  barber: Barber;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  customerName?: string;
  customerPhone?: string;
}

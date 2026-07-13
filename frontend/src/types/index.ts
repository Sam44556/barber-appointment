export type Role = 'customer' | 'barber' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
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

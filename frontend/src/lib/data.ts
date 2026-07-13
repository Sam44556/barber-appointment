import barber1 from '@/assets/barber-1.jpg';
import barber2 from '@/assets/barber-2.jpg';
import barber3 from '@/assets/barber-3.jpg';
import type { Service, Barber } from '@/types';

export const services: Service[] = [
  {
    id: '1',
    name: 'Classic Haircut',
    description: 'Precision cut tailored to your style, includes wash and style',
    duration: 30,
    price: 45,
  },
  {
    id: '2',
    name: 'Beard Trim',
    description: 'Shape, line, and detail your beard to perfection',
    duration: 20,
    price: 25,
  },
  {
    id: '3',
    name: 'Full Package',
    description: 'Haircut, beard trim, hot towel treatment, and styling',
    duration: 60,
    price: 75,
  },
  {
    id: '4',
    name: 'Buzz Cut',
    description: 'Clean, even clipper cut at your desired length',
    duration: 15,
    price: 25,
  },
  {
    id: '5',
    name: 'Fade',
    description: 'Seamless gradient taper from skin to length',
    duration: 40,
    price: 50,
  },
  {
    id: '6',
    name: 'Hot Towel Shave',
    description: 'Traditional straight razor shave with hot towel prep',
    duration: 30,
    price: 35,
  },
];

export const barbers: Barber[] = [
  {
    id: '1',
    name: 'Marcus Chen',
    specialty: 'Fades & Tapers',
    avatarUrl: barber1,
  },
  {
    id: '2',
    name: 'Alex Rivera',
    specialty: 'Classic Cuts',
    avatarUrl: barber2,
  },
  {
    id: '3',
    name: 'DeShawn Williams',
    specialty: 'Beard Design',
    avatarUrl: barber3,
  },
];

export const timeSlots = [
  { time: '9:00', period: 'Morning' },
  { time: '9:30', period: 'Morning' },
  { time: '10:00', period: 'Morning' },
  { time: '10:30', period: 'Morning' },
  { time: '11:00', period: 'Morning' },
  { time: '11:30', period: 'Morning' },
  { time: '12:00', period: 'Afternoon' },
  { time: '12:30', period: 'Afternoon' },
  { time: '13:00', period: 'Afternoon' },
  { time: '13:30', period: 'Afternoon' },
  { time: '14:00', period: 'Afternoon' },
  { time: '14:30', period: 'Afternoon' },
  { time: '15:00', period: 'Afternoon' },
  { time: '15:30', period: 'Afternoon' },
  { time: '16:00', period: 'Evening' },
  { time: '16:30', period: 'Evening' },
  { time: '17:00', period: 'Evening' },
  { time: '17:30', period: 'Evening' },
];

export const bookedSlots = ['10:00', '11:30', '14:00', '16:30'];

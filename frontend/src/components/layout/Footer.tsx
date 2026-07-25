import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Scissors, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800 noise-overlay">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <h3 className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              ✦ FADE CUT
            </h3>
            <p className="font-body text-xs text-gray-400 leading-relaxed">
              Precision haircuts, skin fades, and master beard grooming in the heart of Addis Ababa, Ethiopia.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={15} />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-4">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
              Navigation
            </h4>
            <ul className="space-y-2.5 font-body text-xs">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-white transition-colors">
                  Services & Pricing
                </Link>
              </li>
              <li>
                <Link to="/book" className="text-gray-400 hover:text-white transition-colors font-medium">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="/my-appointments" className="text-gray-400 hover:text-white transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                  Account Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Location & Contact (Addis Ababa, Ethiopia) */}
          <div className="space-y-4">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
              Visit Our Shop
            </h4>
            <div className="space-y-3 font-body text-xs text-gray-400">
              <p className="flex items-start gap-2.5">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <span>
                  Bole Road (In front of Friendship Center),
                  <br />
                  <strong className="text-gray-200">Addis Ababa, Ethiopia</strong>
                </span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone size={16} className="text-primary shrink-0" />
                <span className="font-mono">+251 91 123 4567</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail size={16} className="text-primary shrink-0" />
                <span className="font-mono">contact@fadecutaddis.com</span>
              </p>
            </div>
          </div>

          {/* Shop Hours */}
          <div className="space-y-4">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
              Working Hours
            </h4>
            <div className="space-y-2 font-mono text-xs text-gray-400 border-l border-gray-800 pl-3">
              <div className="flex items-center gap-2 text-gray-300">
                <Clock size={14} className="text-primary" />
                <span className="font-bold">Daily Hours</span>
              </div>
              <p>Morning: 03:00 – 13:00</p>
              <p>Afternoon: 14:00 – 20:00</p>
              <p className="text-[11px] text-gray-500 pt-1">Break: 13:00 – 14:00</p>
            </div>
          </div>
        </div>

        {/* Footer Bottom Line */}
        <div className="mt-12 pt-6 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="font-mono text-[11px] text-gray-500">
            © {new Date().getFullYear()} FADE CUT BARBERSHOP • ADDIS ABABA, ETHIOPIA. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-500">
            <Scissors size={12} /> Premium Grooming Experience
          </div>
        </div>
      </div>
    </footer>
  );
}

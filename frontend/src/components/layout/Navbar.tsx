import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { FADE_UP, STAGGER, EASE } from '@/lib/animations';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Book Now', to: '/book' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const location = useLocation();

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md"
        style={{ borderBottomWidth: 1, borderBottomColor: useTransform(borderOpacity, (v) => `hsl(0 0% 85% / ${v})`) }}
      >
        <nav className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="font-display text-xl font-bold tracking-tight">
            ✦ FADE CUT
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-body text-sm tracking-wide transition-colors hover:text-foreground ${
                  location.pathname === link.to ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="font-body text-sm px-4 py-2 border border-border rounded-sm hover:bg-secondary transition-colors"
            >
              Login
            </Link>
            <Link
              to="/book"
              className="font-body text-sm px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
            >
              Book Now
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16">
              <span className="font-display text-xl font-bold tracking-tight">✦ FADE CUT</span>
              <button onClick={() => setMenuOpen(false)} className="p-2" aria-label="Close menu">
                <X size={24} />
              </button>
            </div>

            <motion.div
              variants={STAGGER}
              initial="hidden"
              animate="visible"
              className="flex-1 flex flex-col items-center justify-center gap-8"
            >
              {navLinks.map((link) => (
                <motion.div key={link.to} variants={FADE_UP}>
                  <Link
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="font-display text-4xl italic hover:opacity-70 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={FADE_UP}>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Login
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

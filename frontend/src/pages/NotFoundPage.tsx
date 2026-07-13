import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FADE_UP, STAGGER, EASE } from '@/lib/animations';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary text-primary-foreground flex items-center justify-center relative overflow-hidden">
      {/* Barber pole stripe animation */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              hsl(var(--white)) 20px,
              hsl(var(--white)) 40px
            )`,
            animation: 'stripeMove 20s linear infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes stripeMove {
          from { background-position: 0 0; }
          to { background-position: 80px 80px; }
        }
      `}</style>

      {/* Giant 404 background */}
      <motion.span
        initial={{ opacity: 0, filter: 'blur(20px)' }}
        animate={{ opacity: 0.08, filter: 'blur(0px)' }}
        transition={{ duration: 1, ease: EASE }}
        className="absolute font-display italic font-bold text-primary-foreground select-none"
        style={{ fontSize: 'clamp(120px, 30vw, 240px)' }}
      >
        404
      </motion.span>

      <motion.div
        variants={STAGGER}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-6"
      >
        <motion.p variants={FADE_UP} className="font-mono text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-4">
          PAGE NOT FOUND
        </motion.p>
        <motion.p variants={FADE_UP} className="font-body text-lg text-gray-300 mb-10">
          Looks like this chair is empty.
        </motion.p>
        <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-3.5 bg-primary-foreground text-primary font-body text-sm rounded-sm hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
          <Link
            to="/book"
            className="px-8 py-3.5 border border-gray-600 font-body text-sm rounded-sm hover:bg-gray-800 transition-colors"
          >
            Book an appointment
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

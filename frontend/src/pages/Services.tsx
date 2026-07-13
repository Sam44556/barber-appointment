import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FADE_UP, STAGGER } from '@/lib/animations';
import { services } from '@/lib/data';

export default function Services() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5 }}
      className="pt-24 pb-16"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-5xl lg:text-7xl font-bold italic mb-6"
          >
            Services
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-px bg-border max-w-md mx-auto"
          />
        </div>

        <motion.div
          variants={STAGGER}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto"
        >
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              variants={FADE_UP}
              className="group flex items-center gap-6 py-6 border-b border-border hover:bg-secondary/50 px-4 -mx-4 transition-colors cursor-pointer"
            >
              <span className="font-mono text-sm text-muted-foreground w-12 shrink-0">
                —{String(i + 1).padStart(2, '0')}
              </span>

              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-bold">{service.name}</h3>
                <p className="font-body text-sm text-muted-foreground">{service.description}</p>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <span className="font-mono text-sm text-muted-foreground hidden sm:block">
                  {service.duration} min
                </span>
                <span className="font-display text-xl font-bold">${service.price}</span>
                <Link
                  to="/book"
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                >
                  Book
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-24 bg-primary text-primary-foreground rounded-sm p-12 lg:p-16 text-center max-w-3xl mx-auto"
        >
          <h2 className="font-display text-3xl lg:text-4xl font-bold italic mb-4">
            Ready?
          </h2>
          <p className="font-body text-gray-300 mb-8">
            Book your appointment in under a minute.
          </p>
          <Link
            to="/book"
            className="inline-block font-body text-sm px-12 py-4 bg-primary-foreground text-primary rounded-sm hover:opacity-90 transition-opacity"
          >
            Book Now
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

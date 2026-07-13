import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FADE_UP, STAGGER, STAGGER_SLOW, EASE } from '@/lib/animations';
import { services, barbers } from '@/lib/data';
import heroImage from '@/assets/hero-barber.jpg';

function HeroSection() {
  const { scrollYProgress } = useScroll();
  const imageScale = useTransform(scrollYProgress, [0, 0.3], [1.05, 1]);

  return (
    <section className="relative min-h-screen bg-primary text-primary-foreground noise-overlay overflow-hidden">
      <div className="relative z-10 container mx-auto px-6 flex flex-col lg:flex-row items-center min-h-screen">
        <motion.div
          variants={STAGGER}
          initial="hidden"
          animate="visible"
          className="flex-1 pt-32 lg:pt-0 lg:pr-16"
        >
          <motion.p variants={FADE_UP} className="section-label text-gray-400 mb-6">
            BROOKLYN'S FINEST
          </motion.p>
          <motion.h1
            variants={FADE_UP}
            className="font-display text-5xl sm:text-6xl lg:text-8xl font-bold italic leading-[0.95] mb-8"
          >
            THE ART
            <br />
            OF THE
            <br />
            <span className="font-normal">CUT</span>
          </motion.h1>
          <motion.p variants={FADE_UP} className="font-body font-light text-gray-300 text-lg max-w-md mb-10">
            Book your appointment in under a minute.
          </motion.p>
          <motion.div variants={FADE_UP} className="flex gap-4">
            <Link
              to="/book"
              className="font-body text-sm px-8 py-3.5 bg-primary-foreground text-primary rounded-sm hover:opacity-90 transition-opacity"
            >
              Book Now
            </Link>
            <Link
              to="/services"
              className="font-body text-sm px-8 py-3.5 border border-gray-600 text-primary-foreground rounded-sm hover:bg-gray-800 transition-colors"
            >
              See Services
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex-1 w-full lg:w-auto mt-12 lg:mt-0 lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[45%]"
          style={{ scale: imageScale }}
        >
          <img
            src={heroImage}
            alt="Professional barber at work"
            className="w-full h-[50vh] lg:h-full object-cover"
            width={1024}
            height={1280}
          />
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <ChevronDown size={24} className="text-gray-500" />
      </motion.div>
    </section>
  );
}

function ServicesPreview() {
  const previewServices = services.slice(0, 3);

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-label mb-12"
        >
          WHAT WE DO
        </motion.p>

        <motion.div
          variants={STAGGER_SLOW}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {previewServices.map((service, i) => (
            <motion.div
              key={service.id}
              variants={FADE_UP}
              className="relative group border-b border-border pb-8 hover:shadow-sm transition-shadow"
            >
              <span className="font-display text-7xl text-gray-100 font-bold absolute -top-4 -left-2 select-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="relative pt-12">
                <h3 className="font-display text-2xl font-bold mb-2">{service.name}</h3>
                <p className="font-body text-sm text-muted-foreground mb-4">{service.description}</p>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-muted-foreground">{service.duration} min</span>
                  <span className="font-display text-lg font-bold">${service.price}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
          className="mt-16 text-center"
        >
          <Link
            to="/services"
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            View all services →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-12"
        >
          MEET THE TEAM
        </motion.p>

        <motion.div
          variants={STAGGER_SLOW}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {barbers.map((barber) => (
            <motion.div
              key={barber.id}
              variants={FADE_UP}
              whileHover={{ scale: 1.02 }}
              className="group relative overflow-hidden cursor-pointer"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={barber.avatarUrl}
                  alt={barber.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  width={640}
                  height={640}
                />
                <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Link
                    to="/book"
                    className="font-body text-sm px-6 py-3 bg-primary-foreground text-primary rounded-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                  >
                    Book with {barber.name.split(' ')[0]}
                  </Link>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-display text-xl">{barber.name}</h3>
                <p className="font-body text-sm text-gray-400">{barber.specialty}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: '01', title: 'Choose service', desc: 'Pick what you need from our menu' },
    { num: '02', title: 'Pick a time', desc: 'Select your preferred date & slot' },
    { num: '03', title: 'Show up', desc: 'We handle the rest — just be on time' },
  ];

  return (
    <section className="py-24 lg:py-32 bg-secondary">
      <div className="container mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-label mb-16 text-center"
        >
          HOW IT WORKS
        </motion.p>

        <motion.div
          variants={STAGGER_SLOW}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
        >
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-border" />

          {steps.map((step) => (
            <motion.div key={step.num} variants={FADE_UP} className="text-center relative">
              <span className="font-display text-6xl lg:text-7xl font-bold text-gray-200 block mb-4">
                {step.num}
              </span>
              <h3 className="font-display text-xl font-bold mb-2">{step.title}</h3>
              <p className="font-body text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
          className="mt-20 text-center"
        >
          <Link
            to="/book"
            className="inline-block font-body text-sm px-12 py-4 bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
          >
            Book Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <HeroSection />
      <ServicesPreview />
      <TeamSection />
      <HowItWorks />
    </motion.div>
  );
}

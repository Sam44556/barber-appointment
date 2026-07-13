import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FADE_UP, STAGGER } from '@/lib/animations';
import interiorImage from '@/assets/barbershop-interior.jpg';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex"
    >
      <div className="flex-1 flex items-center justify-center px-6 py-16 lg:py-0">
        <div className="w-full max-w-md">
          <p className="font-display text-xl font-bold tracking-tight mb-8">✦ FADE CUT</p>

          <h1 className="font-display text-3xl font-bold mb-2">Create your account</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">Book faster. Track your appointments.</p>

          <motion.form
            variants={STAGGER}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <motion.div variants={FADE_UP} className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-body text-sm font-medium block mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div>
                <label className="font-body text-sm font-medium block mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            </motion.div>

            <motion.div variants={FADE_UP}>
              <label className="font-body text-sm font-medium block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors"
              />
            </motion.div>

            <motion.div variants={FADE_UP}>
              <label className="font-body text-sm font-medium block mb-1.5">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors"
              />
            </motion.div>

            <motion.div variants={FADE_UP}>
              <label className="font-body text-sm font-medium block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors"
              />
              {password && (
                <div className="flex gap-1 mt-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < strength ? 'bg-foreground' : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div variants={FADE_UP}>
              <label className="font-body text-sm font-medium block mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors"
              />
            </motion.div>

            <motion.div variants={FADE_UP}>
              <button
                type="submit"
                className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm rounded-sm hover:opacity-90 transition-opacity mt-2"
              >
                Create Account
              </button>
            </motion.div>
          </motion.form>

          <p className="text-center mt-8 font-body text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-foreground hover:underline underline-offset-4">
              Login
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block lg:flex-1 relative">
        <img
          src={interiorImage}
          alt="Barbershop interior"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          width={1280}
          height={960}
        />
      </div>
    </motion.div>
  );
}

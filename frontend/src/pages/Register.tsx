import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FADE_UP, STAGGER } from '@/lib/animations';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';
import interiorImage from '@/assets/barbershop-interior.jpg';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setError('');

    try {
      await register({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        phone: phone || undefined,
      });
      
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
      toast.error('Registration failed');
    }
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
                <label className="font-body text-sm font-medium block mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
                />
              </div>
              <div>
                <label className="font-body text-sm font-medium block mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
                />
              </div>
            </motion.div>

            <motion.div variants={FADE_UP}>
              <label className="font-body text-sm font-medium block mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
              />
            </motion.div>

            <motion.div variants={FADE_UP}>
              <label className="font-body text-sm font-medium block mb-1.5">Phone (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                disabled={isLoading}
                className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
              />
            </motion.div>

            <motion.div variants={FADE_UP}>
              <label className="font-body text-sm font-medium block mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
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
              <label className="font-body text-sm font-medium block mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors disabled:opacity-50"
              />
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: [0, -8, 8, -8, 8, 0] }}
                className="font-body text-xs text-red-500"
              >
                {error}
              </motion.p>
            )}

            <motion.div variants={FADE_UP}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm rounded-sm hover:opacity-90 transition-opacity mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </motion.div>
          </motion.form>

          <p className="text-center mt-8 font-body text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-foreground hover:underline underline-offset-4">
              Sign In
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

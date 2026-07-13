import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FADE_UP, STAGGER, SCALE_IN } from '@/lib/animations';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-secondary flex items-center justify-center px-6 pt-16"
    >
      <motion.div
        variants={SCALE_IN}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-background border border-border rounded-lg p-12"
      >
        <div className="text-center mb-8">
          <p className="font-display text-xl font-bold tracking-tight mb-6">✦ FADE CUT</p>
          <h1 className="font-display text-3xl font-bold mb-2">Welcome back</h1>
          <p className="font-body text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <motion.form
          variants={STAGGER}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <motion.div variants={FADE_UP}>
            <label className="font-body text-sm font-medium block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className={`w-full px-4 py-3.5 border rounded-sm bg-background font-body text-sm focus:outline-none transition-colors ${
                error ? 'border-foreground' : 'border-border focus:border-foreground'
              }`}
            />
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-body text-sm font-medium">Password</label>
              <Link to="/forgot-password" className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-4 py-3.5 border rounded-sm bg-background font-body text-sm focus:outline-none transition-colors ${
                error ? 'border-foreground' : 'border-border focus:border-foreground'
              }`}
            />
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: [0, -8, 8, -8, 8, 0] }}
              className="font-body text-xs text-foreground"
            >
              {error}
            </motion.p>
          )}

          <motion.div variants={FADE_UP}>
            <button
              type="submit"
              className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm rounded-sm hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </motion.div>
        </motion.form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="font-mono text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button className="w-full py-3.5 border border-border rounded-sm font-body text-sm hover:bg-secondary transition-colors">
          Continue with Google
        </button>

        <p className="text-center mt-8 font-body text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-foreground hover:underline underline-offset-4">
            Register
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SCALE_IN, FADE_UP, STAGGER } from '@/lib/animations';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSent(true);
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
        className="w-full max-w-md bg-background border border-border rounded-lg p-12 text-center"
      >
        {!sent ? (
          <>
            <h1 className="font-display text-2xl font-bold mb-2">Reset your password</h1>
            <p className="font-body text-sm text-muted-foreground mb-8">
              Enter your email and we'll send a reset link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full px-4 py-3.5 border border-border rounded-sm bg-background font-body text-sm focus:outline-none focus:border-foreground transition-colors"
              />
              <button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm rounded-sm hover:opacity-90 transition-opacity">
                Send reset link
              </button>
            </form>
          </>
        ) : (
          <motion.div variants={STAGGER} initial="hidden" animate="visible">
            <motion.div variants={FADE_UP} className="text-4xl mb-4">✉️</motion.div>
            <motion.h2 variants={FADE_UP} className="font-display text-2xl font-bold mb-2">Check your inbox</motion.h2>
            <motion.p variants={FADE_UP} className="font-body text-sm text-muted-foreground">
              We sent a reset link to {email}
            </motion.p>
          </motion.div>
        )}

        <Link to="/login" className="inline-block mt-8 font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to login
        </Link>
      </motion.div>
    </motion.div>
  );
}

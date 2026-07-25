import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FADE_UP, STAGGER, SCALE_IN } from '@/lib/animations';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, isAuthenticated, user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Get redirect information from location state
  const from = location.state?.from || '/';
  const loginMessage = location.state?.message;

  // Show message if coming from a protected route
  useEffect(() => {
    if (loginMessage) {
      toast.info(loginMessage);
    }
  }, [loginMessage]);

  // Redirect authenticated users based on their role or back to intended page
  useEffect(() => {
    if (isAuthenticated && user) {
      // If user was trying to access booking, redirect there
      if (from === '/book') {
        navigate('/book');
        return;
      }

      // Otherwise, redirect based on role
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'BARBER':
          navigate('/barber/dashboard');
          break;
        case 'CUSTOMER':
          navigate('/');
          break;
        default:
          navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');

    try {
      await login({ email, password });
      
      // Debug: Log the user data after login
      const currentUser = useAuthStore.getState().user;
      console.log('🔍 User after login:', currentUser);
      console.log('🔍 User role:', currentUser?.role);
      
      toast.success('Welcome back!');
    } catch (error: any) {
      setError(error.message || 'Login failed. Please check your credentials.');
      toast.error('Login failed');
    }
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
              disabled={isLoading}
              className={`w-full px-4 py-3.5 border rounded-sm bg-background font-body text-sm focus:outline-none transition-colors disabled:opacity-50 ${
                error ? 'border-red-500' : 'border-border focus:border-foreground'
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
              disabled={isLoading}
              className={`w-full px-4 py-3.5 border rounded-sm bg-background font-body text-sm focus:outline-none transition-colors disabled:opacity-50 ${
                error ? 'border-red-500' : 'border-border focus:border-foreground'
              }`}
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
              className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </motion.div>
        </motion.form>

        <p className="text-center mt-8 font-body text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link 
            to="/register"
            state={{ from, message: loginMessage }}
            className="text-foreground hover:underline underline-offset-4"
          >
            Register
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth';
import { PAGE_TRANSITION } from '@/lib/animations';
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const ownerNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Appointments', path: '/admin/appointments', icon: Calendar },
  { label: 'Services', path: '/admin/services', icon: Scissors },
  { label: 'Staff', path: '/admin/staff', icon: Users },
  { label: 'Schedule', path: '/admin/schedule', icon: Clock },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = ownerNav;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen w-full bg-primary">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 flex-col fixed inset-y-0 left-0 z-30 bg-primary text-primary-foreground border-r border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <span className="font-display text-lg font-bold tracking-tight">✦ FADE CUT</span>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-body transition-colors',
                  active
                    ? 'text-primary-foreground bg-sidebar-accent border-l-2 border-primary-foreground'
                    : 'text-muted-foreground hover:text-primary-foreground hover:bg-sidebar-accent'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium text-primary-foreground">
              {user?.name?.charAt(0) || 'O'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-primary-foreground">{user?.name || 'Owner'}</p>
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">{user?.role || 'owner'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-primary-foreground transition-colors rounded-md hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-primary border-t border-sidebar-border flex justify-around py-2">
        {navItems.slice(0, 5).map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 min-w-[44px] min-h-[44px]',
                active ? 'text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col items-center gap-1 p-2 min-w-[44px] min-h-[44px] text-muted-foreground"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="text-[10px]">More</span>
        </button>
      </div>

      {/* Mobile overflow menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-primary/95 backdrop-blur flex flex-col items-center justify-center gap-4">
          {navItems.slice(5).map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className="flex items-center gap-3 text-primary-foreground text-lg"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-3 text-muted-foreground text-lg mt-4">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-60 bg-background min-h-screen pb-20 lg:pb-0">
        <motion.div key={location.pathname} {...PAGE_TRANSITION} className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;

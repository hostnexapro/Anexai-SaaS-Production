import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  PlusSquare, 
  FolderOpen, 
  Settings, 
  LogOut, 
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  const isAdmin = profile?.role === 'admin';

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: PlusSquare, label: 'New Project', href: '/projects/new' },
    { icon: FolderOpen, label: 'My Projects', href: '/projects' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setLocation('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-800 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
          <span className="font-display font-bold text-xl text-white">A</span>
        </div>
        <span className="font-display font-bold text-2xl tracking-tight text-white">Anexai</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== '/dashboard' && location.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 mt-auto">
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground">{isAdmin ? 'Administrator' : 'Creator'}</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex text-foreground overflow-hidden">
      <div className="ambient-glow"></div>
      <div className="ambient-glow-bottom"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col glass-panel border-y-0 border-l-0 rounded-none z-20 relative">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 flex flex-col glass-panel border-y-0 border-l-0 rounded-none z-50 md:hidden bg-[#030712]/95"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-4 p-2 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <header className="h-20 glass-panel border-x-0 border-t-0 rounded-none px-4 sm:px-8 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-white/70 hover:text-white bg-white/5 rounded-lg border border-white/10"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
              {location === '/dashboard' ? 'Overview' : 
               location.startsWith('/projects/new') ? 'AI Generator' :
               location.startsWith('/projects') ? 'Projects' :
               location === '/admin' ? 'Admin Settings' : 'Anexai'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link 
                href="/admin" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Admin</span>
              </Link>
            )}
            <div className="hidden sm:block text-sm text-muted-foreground border-l border-white/10 pl-4">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

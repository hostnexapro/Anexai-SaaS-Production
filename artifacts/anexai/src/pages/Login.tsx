import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Loader2, Hexagon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [, setLocation] = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // On successful signup, Supabase will log them in and trigger the auth listener
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      setLocation('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Visual left side */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden border-r border-white/10">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
            alt="Space Tech Background" 
            className="w-full h-full object-cover opacity-60 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/50 to-[#030712]"></div>
        </div>
        
        <div className="relative z-10 max-w-lg p-12 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 1 }}
            className="w-24 h-24 mx-auto mb-8 relative"
          >
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl"></div>
            <img src={`${import.meta.env.BASE_URL}images/logo-mark.png`} alt="Anexai Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
          </motion.div>
          <h1 className="text-5xl font-display font-bold text-white mb-6 leading-tight">
            Build the future,<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-300">at lightspeed.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Anexai harnesses the power of advanced LLMs to generate, scaffold, and deploy complete production-ready codebases in seconds.
          </p>
        </div>
      </div>

      {/* Right side Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <div className="ambient-glow lg:hidden"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass-panel p-10 rounded-3xl"
        >
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center lg:hidden">
              <span className="font-display font-bold text-3xl text-primary">A</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-muted-foreground">
              {isSignUp ? 'Enter your details to get started.' : 'Enter your credentials to access your workspace.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 ml-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input outline-none"
                placeholder="you@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-white/80">Password</label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input outline-none"
                placeholder="••••••••"
              />
            </div>

            <PremiumButton 
              type="submit" 
              className="w-full mt-8" 
              isLoading={loading}
              size="lg"
            >
              {!loading && <Sparkles className="w-5 h-5 mr-2 opacity-80" />}
              {isSignUp ? 'Initialize Workspace' : 'Sign In'}
            </PremiumButton>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

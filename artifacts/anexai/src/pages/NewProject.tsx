import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { useCreateProject } from '@workspace/api-client-react';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Sparkles, Terminal, Cpu, Layout, Layers, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const techStacks = [
  { id: 'React + Tailwind', icon: Layout, desc: 'Frontend heavy, fast UI' },
  { id: 'Next.js Fullstack', icon: Layers, desc: 'SSR, API routes, scalable' },
  { id: 'Python FastAPI', icon: Terminal, desc: 'Backend AI logic, data processing' },
  { id: 'Node.js Express', icon: Cpu, desc: 'REST APIs, microservices' },
];

export default function NewProject() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const createProject = useCreateProject();
  
  const [prompt, setPrompt] = useState('');
  const [techStack, setTechStack] = useState(techStacks[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !user) return;

    setIsGenerating(true);
    setError(null);

    try {
      const project = await createProject.mutateAsync({
        data: {
          prompt,
          techStack,
          userId: user.id
        }
      });
      setLocation(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate project. Please check your API keys in the admin dashboard.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md rounded-3xl"
          >
            <div className="w-24 h-24 relative mb-8">
              <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute inset-0 border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-b-purple-400 border-l-purple-400 border-t-transparent border-r-transparent rounded-full animate-spin animation-delay-150"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-2 text-glow">Synthesizing Codebase</h3>
            <p className="text-primary font-mono text-sm animate-pulse">Compiling components • Generating logic • Structuring files</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">Create New Project</h2>
        <p className="text-muted-foreground">Describe your vision. Anexai's Gemini-powered engine will build it.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium">Generation Failed</h4>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass-panel p-1 rounded-2xl focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all">
          <div className="bg-[#030712] rounded-xl p-6 relative group">
            <label className="block text-sm font-medium text-white/80 mb-3 uppercase tracking-wider">Project Prompt</label>
            <textarea
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-48 bg-transparent text-white placeholder:text-white/20 outline-none resize-none text-lg leading-relaxed font-sans"
              placeholder="E.g., Build a modern task management dashboard with a dark theme, draggable columns, and a sidebar navigation..."
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs font-mono text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Sparkles className="w-3 h-3 text-primary" /> Gemini 1.5 Flash
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-4 uppercase tracking-wider">Architecture Stack</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {techStacks.map((stack) => (
              <div 
                key={stack.id}
                onClick={() => setTechStack(stack.id)}
                className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  techStack === stack.id 
                    ? 'bg-primary/20 border-primary shadow-[inset_0_0_20px_rgba(139,92,246,0.2)]' 
                    : 'glass-panel hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${techStack === stack.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-muted-foreground'}`}>
                    <stack.icon className="w-5 h-5" />
                  </div>
                  <span className={`font-semibold ${techStack === stack.id ? 'text-white' : 'text-white/80'}`}>{stack.id}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stack.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <PremiumButton 
            type="submit" 
            size="lg" 
            disabled={isGenerating || !prompt.trim()}
            className="w-full sm:w-auto min-w-[200px]"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Project
          </PremiumButton>
        </div>
      </form>
    </div>
  );
}

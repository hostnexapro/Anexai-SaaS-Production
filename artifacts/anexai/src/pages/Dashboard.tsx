import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useGetProjects } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Terminal, FolderGit2, Cpu, ArrowRight, Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PremiumButton } from '@/components/ui/PremiumButton';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: projectsData, isLoading } = useGetProjects();
  
  const projects = projectsData?.projects || [];
  const recentProjects = [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  
  const stats = [
    { label: 'Total Projects', value: projects.length.toString(), icon: FolderGit2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'GitHub Pushes', value: projects.filter(p => p.githubUrl).length.toString(), icon: Terminal, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'AI Operations', value: (projects.length * 152).toString(), icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 md:w-2/3">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-300">{user?.email?.split('@')[0]}</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Your workspace is ready. What are we building today? Let Anexai handle the boilerplate while you focus on the vision.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/projects/new">
              <PremiumButton>Start New Project</PremiumButton>
            </Link>
            <Link href="/projects">
              <PremiumButton variant="secondary">View All Projects</PremiumButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl flex items-center gap-5 hover:border-white/20 transition-all hover:-translate-y-1">
            <div className={`w-14 h-14 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-display font-bold text-white tracking-tight">
                {isLoading ? <span className="animate-pulse bg-white/10 text-transparent rounded w-12 inline-block">00</span> : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Recent Activity
          </h3>
          <Link href="/projects" className="text-sm text-primary hover:text-purple-300 flex items-center gap-1 group">
            View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading workspace data...</p>
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                <FolderGit2 className="w-8 h-8 text-white/20" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">No projects yet</h4>
              <p className="text-muted-foreground mb-6">Generate your first AI-powered codebase to see it here.</p>
              <Link href="/projects/new">
                <PremiumButton variant="glass">Generate Project</PremiumButton>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentProjects.map((project) => (
                <Link 
                  key={project.id} 
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors group block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center shrink-0">
                      <Terminal className="w-5 h-5 text-white/70 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-white group-hover:text-primary transition-colors">{project.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">{project.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-white/70 border border-white/10">
                      {project.techStack}
                    </span>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

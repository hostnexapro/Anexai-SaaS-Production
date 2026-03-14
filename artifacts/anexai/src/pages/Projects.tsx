import React from 'react';
import { useGetProjects } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { FolderGit2, Plus, Github, Clock, LayoutGrid, LayoutList } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { motion } from 'framer-motion';

export default function Projects() {
  const { data: projectsData, isLoading } = useGetProjects();
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  
  const projects = projectsData?.projects || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-1">My Projects</h2>
          <p className="text-muted-foreground">Manage and deploy your AI-generated applications.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="glass-panel flex p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
          <Link href="/projects/new">
            <PremiumButton size="sm" className="hidden sm:flex">
              <Plus className="w-4 h-4 mr-2" /> New Project
            </PremiumButton>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel p-6 rounded-2xl h-56 animate-pulse">
              <div className="w-12 h-12 bg-white/5 rounded-xl mb-4"></div>
              <div className="h-6 bg-white/5 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-white/5 rounded w-full mb-2"></div>
              <div className="h-4 bg-white/5 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl flex flex-col items-center justify-center border-dashed border-2 border-white/20">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <FolderGit2 className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-display font-bold text-white mb-3">No projects yet</h3>
          <p className="text-muted-foreground max-w-md mb-8 text-lg">
            You haven't generated any projects. Describe what you want to build and Anexai will generate the code.
          </p>
          <Link href="/projects/new">
            <PremiumButton size="lg">Generate Your First Project</PremiumButton>
          </Link>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link 
                href={`/projects/${project.id}`}
                className={`group block glass-panel hover:bg-white/10 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-all duration-300 ${
                  viewMode === 'grid' ? 'p-6 rounded-2xl h-full flex flex-col' : 'p-4 rounded-xl flex items-center gap-6'
                }`}
              >
                <div className={viewMode === 'grid' ? 'mb-4' : 'shrink-0'}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-900/40 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <FolderGit2 className="w-6 h-6" />
                  </div>
                </div>
                
                <div className={viewMode === 'grid' ? 'flex-1' : 'flex-1 grid grid-cols-12 gap-4 items-center'}>
                  <div className={viewMode === 'grid' ? '' : 'col-span-4'}>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
                    {viewMode === 'grid' && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>}
                  </div>
                  
                  {viewMode === 'list' && (
                    <div className="col-span-4 text-sm text-muted-foreground line-clamp-1">{project.description}</div>
                  )}

                  <div className={viewMode === 'grid' ? 'flex items-center justify-between mt-auto pt-4 border-t border-white/5' : 'col-span-4 flex items-center justify-end gap-6'}>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#030712] text-white border border-white/10 shadow-inner">
                      {project.techStack}
                    </span>
                    
                    <div className="flex items-center gap-3 text-muted-foreground text-xs font-medium">
                      {project.githubUrl && (
                        <span title="Pushed to GitHub" className="text-white hover:text-blue-400 transition-colors">
                          <Github className="w-4 h-4" />
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(project.createdAt))} ago
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

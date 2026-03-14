import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { useGetProject, usePushToGithub, useDeleteProject } from '@workspace/api-client-react';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { 
  FileCode2, FileJson, FileText, ChevronRight, Github, 
  Trash2, ExternalLink, ArrowLeft, Loader2, CheckCircle2 
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

// Quick utility to get file icons
const getFileIcon = (filename: string) => {
  if (filename.endsWith('.tsx') || filename.endsWith('.ts') || filename.endsWith('.jsx') || filename.endsWith('.js')) return FileCode2;
  if (filename.endsWith('.json')) return FileJson;
  return FileText;
};

export default function ProjectDetail() {
  const [, params] = useRoute('/projects/:id');
  const [, setLocation] = useLocation();
  const projectId = params?.id || '';
  
  const { data: project, isLoading, error } = useGetProject(projectId);
  const pushToGithub = usePushToGithub();
  const deleteProject = useDeleteProject();

  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [repoName, setRepoName] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [pushStatus, setPushStatus] = useState<{loading: boolean, success: boolean, error: string | null}>({
    loading: false, success: false, error: null
  });

  // Set default active file when project loads
  React.useEffect(() => {
    if (project?.files && project.files.length > 0 && !activeFile) {
      setActiveFile(project.files[0].path);
    }
  }, [project, activeFile]);

  const handlePushToGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoName.trim()) return;
    
    setPushStatus({ loading: true, success: false, error: null });
    try {
      await pushToGithub.mutateAsync({
        id: projectId,
        data: { repoName, isPrivate }
      });
      setPushStatus({ loading: false, success: true, error: null });
      setTimeout(() => setIsGithubModalOpen(false), 2000);
    } catch (err: any) {
      setPushStatus({ loading: false, success: false, error: err.message || 'Failed to push. Check Admin settings.' });
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      try {
        await deleteProject.mutateAsync({ id: projectId });
        setLocation('/projects');
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  if (isLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  if (error || !project) return (
    <div className="glass-panel p-8 text-center rounded-2xl">
      <h2 className="text-xl text-red-400 font-bold mb-2">Project not found</h2>
      <Link href="/projects"><PremiumButton variant="secondary">Go back to projects</PremiumButton></Link>
    </div>
  );

  const currentFileContent = project.files.find(f => f.path === activeFile)?.content || '';

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/projects" className="text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-2xl font-display font-bold text-white">{project.name}</h2>
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary/20 text-primary border border-primary/30">
              {project.techStack}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1 ml-8">{project.description}</p>
        </div>
        
        <div className="flex items-center gap-3 ml-8 md:ml-0">
          {project.githubUrl ? (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20 text-sm font-medium">
              <Github className="w-4 h-4" /> View Repository <ExternalLink className="w-3 h-3 ml-1 text-white/50" />
            </a>
          ) : (
            <PremiumButton onClick={() => { setRepoName(project.name.toLowerCase().replace(/\s+/g, '-')); setIsGithubModalOpen(true); }} size="sm">
              <Github className="w-4 h-4 mr-2" /> Push to GitHub
            </PremiumButton>
          )}
          <button onClick={handleDelete} className="p-2 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors border border-transparent hover:border-red-400/20">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 overflow-hidden">
        
        {/* File Tree */}
        <div className="w-full md:w-64 lg:w-80 shrink-0 flex flex-col glass-panel rounded-2xl overflow-hidden border-white/10">
          <div className="p-4 bg-black/40 border-b border-white/10 shrink-0">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Project Files</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {project.files.map((file) => {
              const Icon = getFileIcon(file.path);
              const isActive = activeFile === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setActiveFile(file.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all mb-1 ${
                    isActive 
                      ? 'bg-primary/20 text-white shadow-[inset_3px_0_0_0_rgba(139,92,246,1)]' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-white/40'}`} />
                  <span className="truncate">{file.path}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden border-white/10 bg-[#0d1117]">
          <div className="flex items-center px-4 h-12 bg-black/40 border-b border-white/10 shrink-0">
            <div className="flex gap-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
            <div className="px-4 py-1 rounded-t-lg bg-[#0d1117] border-x border-t border-white/10 text-xs font-mono text-white/70 translate-y-[1px]">
              {activeFile || 'Select a file'}
            </div>
          </div>
          <div className="flex-1 overflow-auto relative">
            <pre className="p-6 text-sm font-mono text-[#e2e8f0] leading-relaxed absolute inset-0">
              <code>{currentFileContent}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* GitHub Push Modal */}
      <AnimatePresence>
        {isGithubModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => !pushStatus.loading && setIsGithubModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md glass-panel p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
                <Github className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-2">Push to GitHub</h3>
              <p className="text-muted-foreground text-sm mb-6">Deploy this codebase directly to your GitHub account.</p>

              {pushStatus.success ? (
                <div className="py-8 text-center text-emerald-400">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-1">Successfully Pushed!</h4>
                  <p className="text-sm">Your repository is now live.</p>
                </div>
              ) : (
                <form onSubmit={handlePushToGithub} className="space-y-5">
                  {pushStatus.error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {pushStatus.error}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Repository Name</label>
                    <input
                      required
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input"
                      placeholder="my-awesome-project"
                    />
                  </div>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={isPrivate} 
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-black/50 text-primary focus:ring-primary/50"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">Private Repository</div>
                      <div className="text-xs text-muted-foreground">Only you can see this repository</div>
                    </div>
                  </label>

                  <div className="flex justify-end gap-3 pt-4">
                    <PremiumButton type="button" variant="glass" onClick={() => setIsGithubModalOpen(false)}>Cancel</PremiumButton>
                    <PremiumButton type="submit" isLoading={pushStatus.loading}>Confirm Push</PremiumButton>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

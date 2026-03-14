import React, { useState, useEffect } from 'react';
import { useGetSettings, useUpdateSettings } from '@workspace/api-client-react';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { ShieldAlert, Key, Github, Save, CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Admin() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const [geminiKey, setGeminiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (settings) {
      if (settings.geminiApiKey) setGeminiKey('••••••••••••••••••••••••••••••••••••••••');
      if (settings.githubToken) setGithubToken('••••••••••••••••••••••••••••••••••••••••');
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const payload: any = {};
      if (geminiKey && !geminiKey.includes('••••')) payload.geminiApiKey = geminiKey;
      if (githubToken && !githubToken.includes('••••')) payload.githubToken = githubToken;

      if (Object.keys(payload).length > 0) {
        await updateSettings.mutateAsync({ data: payload });
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
          <Lock className="w-8 h-8 text-primary" /> Platform Integrations
        </h2>
        <p className="text-muted-foreground">Manage secret API keys and global system configuration securely.</p>
      </div>

      <div className="glass-panel rounded-3xl p-1 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="bg-[#030712]/50 rounded-[22px] p-6 sm:p-10 relative z-10 backdrop-blur-xl">
          <form onSubmit={handleSave} className="space-y-8">

            {/* Gemini Setup */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Google Gemini API</h3>
                  <p className="text-xs text-muted-foreground">Required for the AI code generation engine</p>
                </div>
              </div>
              <div className="space-y-2 pl-12">
                <label className="text-sm font-medium text-white/80">API Key</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input font-mono text-sm tracking-widest"
                  placeholder="AIzaSy..."
                />
              </div>
            </div>

            {/* GitHub Setup */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                <div className="p-2 bg-white/10 text-white rounded-lg">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">GitHub Integration</h3>
                  <p className="text-xs text-muted-foreground">Personal Access Token (PAT) with repo scopes</p>
                </div>
              </div>
              <div className="space-y-2 pl-12">
                <label className="text-sm font-medium text-white/80">Personal Access Token</label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input font-mono text-sm tracking-widest"
                  placeholder="ghp_..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                {saveStatus === 'success' && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Keys securely stored
                  </motion.div>
                )}
                {saveStatus === 'error' && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-red-400 text-sm font-medium">
                    <ShieldAlert className="w-4 h-4" /> Failed to save settings
                  </motion.div>
                )}
              </div>
              <PremiumButton type="submit" isLoading={isSaving || isLoading} size="lg">
                <Save className="w-5 h-5 mr-2" />
                Save Configuration
              </PremiumButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

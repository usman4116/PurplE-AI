'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Lock, Palette, Database, Trash2, Download } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { theme, setTheme } = useTheme();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="h-4 w-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
    { id: 'data', label: 'Data', icon: <Database className="h-4 w-4" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Profile Settings</h3>
            <p className="text-sm text-muted-foreground">Update your personal information.</p>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input placeholder="Your Name" />
              </div>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">Save Changes</Button>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Appearance</h3>
            <p className="text-sm text-muted-foreground">Customize how the app looks on your device.</p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div 
                className={`cursor-pointer rounded-lg border-2 p-4 text-center ${theme === 'light' ? 'border-violet-500' : 'border-border'}`}
                onClick={() => setTheme('light')}
              >
                <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-slate-200" />
                <span className="text-sm font-medium">Light</span>
              </div>
              <div 
                className={`cursor-pointer rounded-lg border-2 p-4 text-center ${theme === 'dark' ? 'border-violet-500' : 'border-border'}`}
                onClick={() => setTheme('dark')}
              >
                <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-slate-900" />
                <span className="text-sm font-medium">Dark</span>
              </div>
              <div 
                className={`cursor-pointer rounded-lg border-2 p-4 text-center ${theme === 'system' ? 'border-violet-500' : 'border-border'}`}
                onClick={() => setTheme('system')}
              >
                <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-gradient-to-r from-slate-200 to-slate-900" />
                <span className="text-sm font-medium">System</span>
              </div>
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Export Data</h3>
              <p className="text-sm text-muted-foreground mb-4">Download all your chats and account information.</p>
              <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export All Data</Button>
            </div>
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data.</p>
              <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete Account</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background p-4 sm:p-8">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 rounded-xl border bg-card p-6 shadow-sm"
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

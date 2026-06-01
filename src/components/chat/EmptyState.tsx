'use client';

import { motion } from 'framer-motion';
import { Sparkles, Code, Lightbulb, FileText } from 'lucide-react';

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Explain quantum computing',
      description: 'in simple terms',
      prompt: 'Explain quantum computing in simple terms that a 10-year-old would understand.',
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: 'Write a Python script',
      description: 'for data analysis',
      prompt: 'Write a Python script using pandas to analyze a CSV file and plot the results with matplotlib.',
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: 'Help me brainstorm',
      description: 'startup ideas',
      prompt: 'Brainstorm 5 innovative startup ideas combining AI with education.',
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: 'Summarize this topic',
      description: 'machine learning',
      prompt: 'Summarize the key differences between supervised, unsupervised, and reinforcement learning.',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col items-center text-center"
      >
        <div className="mb-4 flex items-center justify-center">
          <img src="/logo.jpg" alt="Purple AI Logo" className="h-20 w-20 rounded-2xl object-cover shadow-lg shadow-violet-500/20 bg-white" />
        </div>
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
          <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Purple AI
          </span>
        </h1>
        <p className="text-muted-foreground">Your intelligent conversation partner</p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            variants={item}
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className="group relative flex flex-col items-start gap-2 overflow-hidden rounded-xl border border-border/50 bg-card p-4 text-left transition-all hover:border-violet-500/50 hover:bg-violet-500/5 hover:shadow-md dark:hover:bg-violet-900/10"
          >
            <div className="mb-1 rounded-lg bg-secondary p-2 text-violet-500 transition-colors group-hover:bg-violet-500 group-hover:text-white">
              {suggestion.icon}
            </div>
            <div>
              <p className="font-medium">{suggestion.title}</p>
              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
            </div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

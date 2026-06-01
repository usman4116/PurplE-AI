'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Sparkles, Zap, Shield, ArrowRight, MessageSquare, Bot, Code2, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingClient() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 20 } }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden selection:bg-purple-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#050505] to-[#050505]" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[600px] h-[600px] rounded-full bg-fuchsia-600/10 blur-[150px] mix-blend-screen" />
        {/* Subtle Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDB2NDBNNDAgMHY0ME0wIDBoNDBNMCA0MGg0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDM1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      <header className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md rounded-b-3xl">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
            <img src="/logo.jpg" alt="Purple AI Logo" className="relative h-10 w-10 rounded-xl object-cover border border-white/10" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Purple AI</span>
        </motion.div>
        
        <motion.nav 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 transition-all rounded-full">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-white text-black hover:bg-neutral-200 rounded-full px-6 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105">
              Start Free
            </Button>
          </Link>
        </motion.nav>
      </header>

      <main className="relative z-10 w-full overflow-hidden">
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-20 flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 flex flex-col items-start text-left"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              Intelligence, Redefined for You
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Unleash your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-violet-400 drop-shadow-sm">
                Creative Potential
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/60 max-w-xl mb-10 leading-relaxed font-light">
              Purple AI isn't just another chatbot. It's an immersive, memory-driven intelligent companion designed to amplify your productivity through a breathtakingly smooth interface.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-8 rounded-full text-base bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] border-0 group transition-all hover:scale-105">
                  Launch App
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.2, type: 'spring' }}
            className="flex-1 w-full relative perspective-1000"
          >
            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
              {/* Floating Chat Bubbles */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-0 p-4 rounded-2xl rounded-tr-sm bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl z-20 w-64"
              >
                <div className="flex gap-3 items-center mb-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center"><Sparkles className="h-3 w-3 text-white"/></div>
                  <div className="text-xs font-medium text-white/80">Purple AI</div>
                </div>
                <p className="text-sm text-white/70">I've generated that complex data model for you. It's ready for review.</p>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 left-0 p-4 rounded-2xl rounded-tl-sm bg-gradient-to-br from-purple-600 to-violet-600 shadow-[0_20px_40px_rgba(139,92,246,0.3)] z-30 w-64"
              >
                <p className="text-sm text-white">Wow, this was incredibly fast! Thanks.</p>
              </motion.div>

              {/* Main Abstract Shape */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-purple-500/20 to-violet-500/20 blur-3xl absolute" />
                <div className="w-[200px] h-[200px] rounded-[40px] rotate-12 bg-white/5 border border-white/10 backdrop-blur-2xl flex items-center justify-center shadow-2xl">
                  <BrainCircuit className="h-20 w-20 text-purple-400/50" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Bento Grid Features */}
        <section className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">Brilliance</span></h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">Everything you need to construct ideas, code, and content at the speed of thought.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
            {/* Large Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="md:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-8 flex flex-col justify-between overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Real-time Streaming</h3>
                <p className="text-white/60 max-w-md">Experience zero latency. Responses stream in character by character, powered by the Next.js Edge runtime.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-3xl bg-white/5 border border-white/10 p-8 flex flex-col justify-between group"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                  <Code2 className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Developer Ready</h3>
                <p className="text-white/60 text-sm">Rich markdown support with flawless syntax highlighting.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="rounded-3xl bg-white/5 border border-white/10 p-8 flex flex-col justify-between group"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                  <Shield className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Private Context</h3>
                <p className="text-white/60 text-sm">Your chats are secured with enterprise-grade auth and MongoDB.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="md:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-8 flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Seamless AI Integration</h3>
                <p className="text-white/60 max-w-md">Powered by the latest LLMs. Switch between models and contexts with zero friction.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent blur-3xl -z-10" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to elevate your workflow?</h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">Join today and experience the smartest, fastest AI chat interface ever built.</p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-10 rounded-full text-lg bg-white text-black hover:bg-neutral-200 shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-transform hover:scale-105">
              Get Started for Free
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-md py-12 text-center text-white/40">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-4 w-4" />
          <span>Purple AI</span>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} Purple AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Card, AnimatedBackground } from '@/components/ui';
import { Bot, Sparkles } from 'lucide-react';
import config from '@/config';
import gsap from 'gsap';

interface LoginPageProps {
  onLogin: (name: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  // GSAP entrance animation
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from(cardRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      scale: 0.95,
    })
    .from(logoRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      scale: 0.8,
    }, '-=0.3')
    .from(titleRef.current, {
      y: 15,
      opacity: 0,
      duration: 0.4,
    }, '-=0.2')
    .from(subtitleRef.current, {
      y: 10,
      opacity: 0,
      duration: 0.4,
    }, '-=0.2')
    .from(formRef.current, {
      y: 15,
      opacity: 0,
      duration: 0.5,
    }, '-=0.2')
    .from(infoRef.current, {
      y: 10,
      opacity: 0,
      duration: 0.4,
    }, '-=0.1');

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 relative overflow-hidden p-4">
      {/* Animated Background */}
      <AnimatedBackground />

      <div ref={cardRef}>
        <Card className="w-full max-w-md p-10 relative z-10" hover>
          <div className="text-center mb-8">
            {/* Logo */}
            <div ref={logoRef} className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-glow-mixed mb-6">
              <Bot className="h-8 w-8 text-white" />
            </div>

            {/* Title */}
            <h1 ref={titleRef} className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              {config.app.title}
              <Sparkles className="h-6 w-6 text-primary-400" />
            </h1>
            <p ref={subtitleRef} className="text-gray-400">{config.app.subtitle}</p>
          </div>

          {/* Login Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!name.trim()}
            >
              Start Chatting
            </Button>
          </form>

          {/* Info */}
          <div ref={infoRef} className="mt-8 pt-6 border-t border-white/[0.08]">
            <p className="text-sm text-gray-500 text-center">
              Get instant answers to your construction-related questions with AI-powered assistance
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

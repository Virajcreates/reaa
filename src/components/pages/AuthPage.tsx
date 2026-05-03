import React, { useState } from 'react';
import { Button, Input, AnimatedBackground } from '@/components/ui';
import { Mail, Lock, Shield, BarChart3, FileSearch } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ReaaLogo } from '@/components/ui';

const FEATURES = [
  {
    icon: Shield,
    title: 'RERA-Compliant Insights',
    desc: 'Stay aligned with regulations and reduce legal risk',
  },
  {
    icon: BarChart3,
    title: 'Project Intelligence',
    desc: 'Analyze builder data, approvals, and timelines',
  },
  {
    icon: FileSearch,
    title: 'AI Document Analysis',
    desc: 'Extract insights from legal and project documents',
  },
];

export function AuthPage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        setErrorMsg('If this is a new account, please check your email for a verification link!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Authentication failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left Branding Panel ── */}
      <div className="auth-left">
        <div className="auth-left-content">
          {/* Logo */}
          <div className="auth-brand">
            <ReaaLogo size={40} />
            <div>
              <div className="auth-brand-name">REAA</div>
              <div className="auth-brand-sub">Real Estate Advisory Assistant</div>
            </div>
          </div>

          {/* Hero */}
          <h1 className="auth-hero">
            Smarter Real Estate Decisions.
            <br />
            <span className="auth-hero-accent">Stronger Compliance.</span>
          </h1>

          <p className="auth-desc">
            AI-powered RERA intelligence to analyze, verify, and manage real
            estate projects with confidence.
          </p>

          {/* Features */}
          <div className="auth-features">
            {FEATURES.map((f) => (
              <div key={f.title} className="auth-feature">
                <div className="auth-feature-icon">
                  <f.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="auth-feature-title">{f.title}</h4>
                  <p className="auth-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative gradient blob */}
        <div className="auth-left-blob" />
      </div>

      {/* ── Right Login Panel ── */}
      <div className="auth-right">
        <AnimatedBackground />

        <div className="auth-card-wrapper">
          <div className="auth-card">
            <h2 className="auth-card-title">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="auth-card-sub">
              {isLogin
                ? 'Sign in to access your dashboard'
                : 'Get started with REAA today'}
            </p>

            {errorMsg && (
              <div className="auth-error">{errorMsg}</div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
              <div className="auth-field">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  autoComplete="new-email"
                  required
                />
                <Mail className="auth-input-icon" />
              </div>

              <div className="auth-field">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  autoComplete="new-password"
                  required
                />
                <Lock className="auth-input-icon" />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="auth-submit"
                disabled={isSubmitting || loading || !email || !password}
              >
                {isSubmitting
                  ? 'Processing...'
                  : isLogin
                  ? 'Sign In'
                  : 'Sign Up'}
              </Button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="auth-google"
              onClick={handleGoogleAuth}
              disabled={isSubmitting || loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="auth-footer">
              <span className="auth-footer-text">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </span>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="auth-footer-link"
              >
                {isLogin ? 'Register' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

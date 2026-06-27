'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CampusSyncLogo } from '@/components/CampusSyncLogo';
import { ArrowLeft, GraduationCap, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authInputClassName } from '@/lib/auth-ui';
import { ThemeToggle } from '@/components/ThemeToggle';

const SHOW_DEMO_CREDENTIALS = process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === 'true';
const DEMO_STAFF_EMAIL = process.env.NEXT_PUBLIC_STAFF_EMAIL || 'staff@campus.sync';

type LoginMode = 'student' | 'organization';

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const switchMode = (next: LoginMode) => {
    setMode(next);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      toast.error(
        mode === 'organization'
          ? 'Invalid organization email or password'
          : 'Invalid email or password'
      );
    } else {
      toast.success('Logged in successfully');
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-page">
      <header className="flex flex-col gap-3 sm:flex-row sm:h-[100px] sm:items-center sm:justify-between px-4 sm:px-8 md:px-20 pt-4 pb-2 sm:pb-0">
        <CampusSyncLogo href="/" size="md" className="self-start sm:hidden" />
        <CampusSyncLogo href="/" size="lg" className="hidden sm:flex self-start" />
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <ThemeToggle />
          <Link href="/" className="flex items-center gap-2 text-[13px] sm:text-[14px] font-bold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to </span>Home
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px]"
        >
          <div className="bg-card rounded-[32px] border border-border shadow-sm p-8 md:p-10">
            <div className="mb-6 text-center">
              <h2 className="text-[28px] font-bold text-heading tracking-tight">Welcome Back</h2>
              <p className="text-[14px] text-muted-foreground mt-2 font-medium">
                {mode === 'organization'
                  ? 'Sign in to your organization account'
                  : 'Sign in to your student account'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-page mb-6">
              <button
                type="button"
                onClick={() => switchMode('student')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition-all',
                  mode === 'student'
                    ? 'bg-card text-heading shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <GraduationCap className="h-4 w-4" />
                Student
              </button>
              <button
                type="button"
                onClick={() => switchMode('organization')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition-all',
                  mode === 'organization'
                    ? 'bg-card text-heading shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Building2 className="h-4 w-4" />
                Organization
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] font-bold text-foreground ml-1">
                  {mode === 'organization' ? 'Organization Email' : 'Email Address'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={mode === 'organization' ? DEMO_STAFF_EMAIL : 'name@college.edu'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={authInputClassName}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[13px] font-bold text-foreground">Password</Label>
                  {mode === 'student' && (
                    <Link href="/forgot-password" className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700">Forgot?</Link>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={authInputClassName}
                  required
                />
              </div>

              <Button
                className="w-full h-12 rounded-xl font-bold text-[15px] mt-2 bg-foreground text-background hover:bg-foreground/90"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Signing in...'
                  : mode === 'organization'
                    ? 'Login as Organization'
                    : 'Login as Student'}
              </Button>

              {mode === 'student' && (
                <div className="text-[13px] text-center font-semibold text-muted-foreground pt-2">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="text-[#1C64F2] hover:text-blue-700">
                    Sign up with OTP
                  </Link>
                </div>
              )}
            </form>

            {mode === 'student' ? (
              <div className="mt-6 rounded-2xl border border-border bg-sidebar p-4">
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">Students:</span> sign up once with email OTP, then log in anytime from the Student tab.
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-border bg-sidebar p-4">
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">Organization login:</span> use the email and password issued by your campus administrator.
                </p>
                {SHOW_DEMO_CREDENTIALS && (
                  <p className="text-[12px] text-muted-foreground mt-2 font-mono">
                    Local demo — Email: <span className="font-semibold text-foreground">{DEMO_STAFF_EMAIL}</span>
                    {' · '}Password: <span className="font-semibold text-foreground">password123</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

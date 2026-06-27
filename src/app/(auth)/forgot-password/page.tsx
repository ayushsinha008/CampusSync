'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CampusSyncLogo } from '@/components/CampusSyncLogo';
import { authInputClassName } from '@/lib/auth-ui';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');

      toast.success('Password changed successfully! Logging you in...');

      const login = await signIn('credentials', {
        redirect: false,
        email,
        password: newPassword,
      });

      if (login?.error) {
        toast.error('Password updated. Please log in with your new password.');
        router.push('/login');
        return;
      }

      toast.success('Welcome back! Your password has been updated.');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-page">
      <header className="flex flex-col gap-3 sm:flex-row sm:h-[100px] sm:items-center sm:justify-between px-4 sm:px-8 md:px-20 pt-4 pb-2 sm:pb-0">
        <CampusSyncLogo href="/" size="md" className="self-start sm:hidden" />
        <CampusSyncLogo href="/" size="lg" className="hidden sm:flex self-start" />
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <ThemeToggle />
          <Link href="/login" className="flex items-center gap-2 text-[13px] sm:text-[14px] font-bold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to </span>Login
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[440px] bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-8 md:p-10"
        >
          <div className="mb-6 text-center">
            <h2 className="text-[28px] font-bold text-[#111827] tracking-tight">Forgot Password</h2>
            <p className="text-[14px] text-slate-500 mt-2 font-medium">
              {step === 1
                ? 'Enter your student email to receive an OTP'
                : 'Enter OTP and set your new password'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                onSubmit={handleSendOtp}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[13px] font-bold text-slate-700 ml-1">
                    Student Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={authInputClassName}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-bold bg-[#1C1A3A] hover:bg-[#2D2B52] text-white"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP to Email'}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                onSubmit={handleReset}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-[13px] font-bold text-slate-700 ml-1">
                    Email OTP
                  </Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`${authInputClassName} text-center tracking-[0.4em] font-bold`}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-[13px] font-bold text-slate-700 ml-1">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={authInputClassName}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[13px] font-bold text-slate-700 ml-1">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={authInputClassName}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-bold bg-[#1C1A3A] hover:bg-[#2D2B52] text-white"
                >
                  {loading ? 'Updating...' : 'Reset Password & Login'}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-[13px] font-semibold text-slate-500 hover:text-slate-800"
                >
                  Use a different email
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

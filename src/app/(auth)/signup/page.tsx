'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthRoleInfo } from '@/components/AuthRoleInfo';
import { CampusSyncLogo } from '@/components/CampusSyncLogo';
import { authInputClassName } from '@/lib/auth-ui';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success('OTP sent to your email');
        setStep(2);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Something went wrong');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, otp }),
      });

      if (res.ok) {
        toast.success('Account created successfully');
        router.push('/login');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Invalid OTP');
      }
    } catch {
      toast.error('An error occurred');
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
          className="w-full max-w-[420px]"
        >
          <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="mb-8 text-center">
              <h2 className="text-[28px] font-bold text-[#111827] tracking-tight">Create Account</h2>
              <p className="text-[14px] text-slate-500 mt-2 font-medium">
                {step === 1
                  ? 'Students: sign up with email OTP verification.'
                  : 'Enter the 6-digit OTP sent to your email.'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSendOtp}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[13px] font-bold text-slate-700 ml-1">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={authInputClassName}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[13px] font-bold text-slate-700 ml-1">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={authInputClassName}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[13px] font-bold text-slate-700 ml-1">Password</Label>
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

                  <Button className="w-full h-12 rounded-xl bg-[#1C1A3A] hover:bg-[#2D2B52] text-white font-bold text-[15px] mt-2 transition-all" type="submit" disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Continue'}
                  </Button>

                  <div className="text-[13px] text-center font-semibold text-slate-500 pt-2">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#1C64F2] hover:text-blue-700">
                      Log in here
                    </Link>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegister}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-[13px] font-bold text-slate-700 ml-1">One-Time Password</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className={`${authInputClassName} text-center tracking-[0.5em] font-bold`}
                      required
                      maxLength={6}
                    />
                  </div>

                  <div className="flex flex-col gap-3 mt-2">
                    <Button className="w-full h-12 rounded-xl bg-[#1C64F2] hover:bg-blue-700 text-white font-bold text-[15px] transition-all" type="submit" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify & Create Account'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={loading}
                    >
                      Back
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {step === 1 && <AuthRoleInfo />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

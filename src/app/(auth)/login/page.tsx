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
import { Hexagon, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDemoLogin = (role: 'student' | 'staff') => {
    const demoEmail = role === 'staff' ? 'staff@campus.sync' : 'student@campus.sync';
    const demoPassword = 'password123';
    setEmail(demoEmail);
    setPassword(demoPassword);
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
      toast.error('Invalid credentials');
    } else {
      toast.success('Logged in successfully');
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F7FB]">
      {/* Top Navbar */}
      <header className="flex h-[100px] items-center justify-between px-8 md:px-20 pt-4">
        <Link href="/" className="flex items-center gap-3 font-extrabold text-[24px] text-slate-800 tracking-tight">
          <div className="bg-[#1C1A3A] text-white p-2 rounded-[12px]">
            <Hexagon className="h-6 w-6 fill-current" />
          </div>
          CampusSync
        </Link>
        <Link href="/" className="flex items-center gap-2 text-[14px] font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </header>

      {/* Login Content */}
      <div className="flex-1 flex items-center justify-center p-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
            <div className="mb-8 text-center">
              <h2 className="text-[28px] font-bold text-[#111827] tracking-tight">Welcome Back</h2>
              <p className="text-[14px] text-slate-500 mt-2 font-medium">Log in to your CampusSync account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 h-11"
                  onClick={() => handleDemoLogin('student')}
                >
                  Demo Student
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 h-11"
                  onClick={() => handleDemoLogin('staff')}
                >
                  Demo Staff
                </Button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase font-bold text-slate-400">
                  <span className="bg-white px-3 tracking-wider">Or continue with</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] font-bold text-slate-700 ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-[#FAFAFB] border-slate-200 px-4 text-[14px] focus-visible:ring-1 focus-visible:ring-indigo-500 placeholder:text-slate-400 font-medium"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[13px] font-bold text-slate-700">Password</Label>
                  <Link href="#" className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700">Forgot?</Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-[#FAFAFB] border-slate-200 px-4 text-[14px] focus-visible:ring-1 focus-visible:ring-indigo-500 placeholder:text-slate-400 font-medium"
                  required
                />
              </div>

              <Button className="w-full h-12 rounded-xl bg-[#1C1A3A] hover:bg-[#2D2B52] text-white font-bold text-[15px] mt-6 transition-all" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              
              <div className="text-[13px] text-center font-semibold text-slate-500 mt-6 pt-2">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-[#1C64F2] hover:text-blue-700">
                  Sign up now
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

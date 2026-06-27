import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CampusSyncLogo } from '@/components/CampusSyncLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <header className="flex h-auto min-h-[72px] items-center justify-between px-4 sm:px-8 md:px-16 lg:px-24 py-4 z-20 relative">
        <CampusSyncLogo href="/" size="md" className="sm:hidden" />
        <CampusSyncLogo href="/" size="lg" className="hidden sm:flex" />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col md:flex-row relative z-10 w-full max-w-[1600px] mx-auto overflow-hidden">
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-16 lg:px-24 pt-4 pb-16 sm:pb-24 md:pb-32 z-20 w-full max-w-[800px]">
          <h1 className="text-4xl sm:text-5xl md:text-[64px] lg:text-[76px] font-semibold tracking-tight text-foreground leading-[1.08] mb-6 sm:mb-8">
            Next-Generation<br />
            University<br />
            Management
          </h1>

          <p className="text-muted-foreground text-base sm:text-[17px] md:text-[19px] leading-[1.6] max-w-[480px] mb-8 sm:mb-12 font-medium">
            CampusSync provides an integrated university platform to help you manage your classes, grades, and campus life. Trusted by over 40,000 students.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-foreground hover:bg-foreground/90 text-background font-bold h-12 sm:h-14 px-8 sm:px-10 rounded-[14px] text-[15px] transition-all">
                Log In
              </Button>
            </Link>
            <Link href="/signup" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto font-bold h-12 sm:h-14 px-8 sm:px-10 rounded-[14px] text-[15px] border-border bg-card hover:bg-muted">
                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none z-0 opacity-90 dark:opacity-40">
          <div className="relative w-full h-full">
            <div
              className="absolute top-[-20%] right-[-10%] w-[1200px] h-[800px] bg-gradient-to-tr from-[#E1EDFB] to-[#F1F6FC] dark:from-[#1e3a5f] dark:to-[#0f172a] rounded-xl border-t-[3px] border-l-[3px] border-white/60 dark:border-white/10 shadow-sm"
              style={{ transform: 'rotate(-25deg)' }}
            />
            <div
              className="absolute top-[0%] right-[-15%] w-[1200px] h-[800px] bg-gradient-to-tr from-[#C6DFF8] to-[#E2F0FB] dark:from-[#1d4ed8]/30 dark:to-[#0f172a] rounded-xl border-t-[3px] border-l-[3px] border-white/80 dark:border-white/10 shadow-sm"
              style={{ transform: 'rotate(-25deg)' }}
            />
            <div
              className="absolute top-[20%] right-[-20%] w-[1200px] h-[800px] bg-gradient-to-tr from-[#98C5F4] to-[#C9E3F9] dark:from-[#2563eb]/40 dark:to-[#1e293b] rounded-xl border-t-[3px] border-l-[3px] border-white dark:border-white/10 shadow-[0_4px_20px_rgba(28,100,242,0.05)]"
              style={{ transform: 'rotate(-25deg)' }}
            />
            <div
              className="absolute top-[40%] right-[-25%] w-[1200px] h-[800px] bg-gradient-to-tr from-[#6EAFF0] to-[#A9D5F7] dark:from-[#3b82f6]/50 dark:to-[#1e3a5f] rounded-xl border-t-[3px] border-l-[3px] border-white dark:border-white/10 shadow-[0_8px_30px_rgba(28,100,242,0.1)]"
              style={{ transform: 'rotate(-25deg)' }}
            />
            <div
              className="absolute top-[60%] right-[-30%] w-[1200px] h-[800px] bg-gradient-to-tr from-[#4194EB] to-[#80BFF3] dark:from-[#2563eb]/60 dark:to-[#1d4ed8]/30 rounded-xl border-t-[3px] border-l-[3px] border-white dark:border-white/10 shadow-[0_12px_40px_rgba(28,100,242,0.15)]"
              style={{ transform: 'rotate(-25deg)' }}
            />
            <div
              className="absolute top-[80%] right-[-35%] w-[1200px] h-[800px] bg-gradient-to-tr from-[#2575E6] to-[#55A4ED] dark:from-[#1d4ed8]/70 dark:to-[#3b82f6]/40 rounded-xl border-t-[3px] border-l-[3px] border-white dark:border-white/10 shadow-[0_20px_50px_rgba(28,100,242,0.2)]"
              style={{ transform: 'rotate(-25deg)' }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

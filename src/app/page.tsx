import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden relative">
      {/* Top Navbar */}
      <header className="flex h-[100px] items-center justify-between px-8 md:px-16 lg:px-24 pt-4 z-20 relative">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-[22px] text-slate-800 tracking-tight">
          <Sparkles className="h-7 w-7 text-slate-800 fill-slate-800" />
          CampusSync
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[14px] font-bold text-slate-800 hover:text-indigo-600 transition-colors flex items-center gap-2">
            Main Menu <Minus className="h-5 w-5 stroke-[3px]" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row relative z-10 w-full max-w-[1600px] mx-auto">
        {/* Left Column */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-8 pb-32 z-20 w-full max-w-[800px]">
          <h1 className="text-[54px] md:text-[64px] lg:text-[76px] font-semibold tracking-tight text-[#111827] leading-[1.05] mb-8">
            Next-Generation<br />
            University<br />
            Management
          </h1>
          
          <p className="text-slate-500 text-[17px] md:text-[19px] leading-[1.6] max-w-[480px] mb-12 font-medium">
            CampusSync provides an integrated university platform to help you manage your classes, grades, and campus life. Trusted by over 40,000 students.
          </p>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="bg-[#F0F4FA] hover:bg-[#E2E8F0] text-slate-800 font-bold h-14 px-8 rounded-[14px] text-[15px] shadow-none">
                Try Demo
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#1C64F2] hover:bg-blue-700 text-white h-14 w-14 rounded-[14px] shadow-lg shadow-blue-500/20 p-0 flex items-center justify-center">
                <Plus className="h-6 w-6 stroke-[3px]" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column - Geometric Glass Panes */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none z-0">
          <div className="relative w-full h-full">
            
            {/* The Panes (Stacked Diagonally) */}
            
            {/* Layer 1 (Back) */}
            <div 
              className="absolute top-[-20%] right-[-10%] w-[1200px] h-[800px] bg-gradient-to-tr from-[#E1EDFB] to-[#F1F6FC] rounded-xl border-t-[3px] border-l-[3px] border-white/60 shadow-sm"
              style={{ transform: 'rotate(-25deg)' }}
            />
            
            {/* Layer 2 */}
            <div 
              className="absolute top-[0%] right-[-15%] w-[1200px] h-[800px] bg-gradient-to-tr from-[#C6DFF8] to-[#E2F0FB] rounded-xl border-t-[3px] border-l-[3px] border-white/80 shadow-sm"
              style={{ transform: 'rotate(-25deg)' }}
            />

            {/* Layer 3 */}
            <div 
              className="absolute top-[20%] right-[-20%] w-[1200px] h-[800px] bg-gradient-to-tr from-[#98C5F4] to-[#C9E3F9] rounded-xl border-t-[3px] border-l-[3px] border-white shadow-[0_4px_20px_rgba(28,100,242,0.05)]"
              style={{ transform: 'rotate(-25deg)' }}
            />

            {/* Layer 4 */}
            <div 
              className="absolute top-[40%] right-[-25%] w-[1200px] h-[800px] bg-gradient-to-tr from-[#6EAFF0] to-[#A9D5F7] rounded-xl border-t-[3px] border-l-[3px] border-white shadow-[0_8px_30px_rgba(28,100,242,0.1)]"
              style={{ transform: 'rotate(-25deg)' }}
            />

            {/* Layer 5 (Front) */}
            <div 
              className="absolute top-[60%] right-[-30%] w-[1200px] h-[800px] bg-gradient-to-tr from-[#4194EB] to-[#80BFF3] rounded-xl border-t-[3px] border-l-[3px] border-white shadow-[0_12px_40px_rgba(28,100,242,0.15)]"
              style={{ transform: 'rotate(-25deg)' }}
            />

            {/* Layer 6 (Frontmost) */}
            <div 
              className="absolute top-[80%] right-[-35%] w-[1200px] h-[800px] bg-gradient-to-tr from-[#2575E6] to-[#55A4ED] rounded-xl border-t-[3px] border-l-[3px] border-white shadow-[0_20px_50px_rgba(28,100,242,0.2)]"
              style={{ transform: 'rotate(-25deg)' }}
            />

          </div>
        </div>
      </main>
    </div>
  );
}

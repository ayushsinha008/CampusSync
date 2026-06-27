import { GraduationCap, ShieldCheck } from 'lucide-react';

const STAFF_EMAIL = process.env.NEXT_PUBLIC_STAFF_EMAIL || 'staff@campus.sync';

export function AuthRoleInfo() {
  return (
    <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-[#FAFAFB] p-4 text-left">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        How to access CampusSync
      </p>

      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEEAFD]">
          <GraduationCap className="h-4 w-4 text-[#5B4FCF]" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-slate-800">Student</p>
          <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
            Sign up once with email OTP. After that, log in with the same email and password — no need to register again.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
          <ShieldCheck className="h-4 w-4 text-amber-600" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-slate-800">Staff</p>
          <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
            Staff accounts are not created through Sign Up. Log in with the official staff email and password configured by your administrator.
          </p>
          <div className="mt-2 rounded-lg bg-white border border-slate-100 px-3 py-2 text-[12px] text-slate-700">
            <p>
              <span className="text-slate-400">Staff email:</span>{' '}
              <span className="font-mono">{STAFF_EMAIL}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

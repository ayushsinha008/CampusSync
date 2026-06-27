export function AuthRoleInfo() {
  return (
    <div className="mt-6 rounded-2xl border border-[#5B4FCF]/15 bg-[#EEEAFD]/40 p-4 text-left">
      <p className="text-[12px] text-slate-600 leading-relaxed">
        <span className="font-bold text-[#5B4FCF]">Student sign up only.</span> Create your account with email OTP, then log in from the{' '}
        <span className="font-semibold text-slate-800">Student</span> tab.
      </p>
      <p className="text-[12px] text-slate-500 mt-2 leading-relaxed">
        Campus organizations & faculty use the{' '}
        <span className="font-semibold text-slate-800">Organization</span> tab on the login page — not this form.
      </p>
    </div>
  );
}

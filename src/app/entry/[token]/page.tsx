'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Mail, User, Building2, type LucideIcon } from 'lucide-react';
import { CampusSyncLogo } from '@/components/CampusSyncLogo';

type EntryProfile = {
  name: string;
  email: string;
  image: string | null;
  role: string;
  rollNumber: string | null;
  branch: string | null;
  semester: number | null;
  department?: string;
  status?: string;
  subjects?: string[];
};

export default function EntryPassPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<EntryProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/entry/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Invalid pass');
        setProfile(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Invalid pass'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F7FB] text-slate-500">
        Verifying entry pass...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F7FB] px-4 text-center">
        <p className="text-lg font-semibold text-slate-800">Entry pass not valid</p>
        <p className="text-sm text-slate-500 mt-2">{error || 'This QR code is expired or invalid.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#1C1A3A] to-[#5B4FCF] px-6 py-5 text-white text-center">
          <CampusSyncLogo href={null} showText size="sm" textClassName="text-white" className="justify-center mb-3" />
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">College Entry Pass</p>
          <h1 className="text-xl font-bold mt-1">
            {profile.role === 'faculty' ? 'Faculty Profile' : 'Student Profile'}
          </h1>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 border-4 border-[#EEEAFD] shadow-lg">
              <AvatarImage src={profile.image || undefined} alt={profile.name} />
              <AvatarFallback className="bg-[#EEEAFD] text-[#5B4FCF] text-3xl font-bold">
                {profile.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-slate-800 mt-4">{profile.name}</h2>
            <Badge className="mt-2 bg-[#EEEAFD] text-[#5B4FCF]">
              {profile.role === 'staff'
                ? 'Organization Admin'
                : profile.role === 'faculty'
                  ? 'Faculty'
                  : 'Student'}
            </Badge>
          </div>

          <div className="space-y-3 rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <DetailRow icon={Mail} label="Email" value={profile.email} />
            {profile.role === 'faculty' && profile.department && (
              <DetailRow icon={Building2} label="Department" value={profile.department} />
            )}
            {profile.role === 'faculty' && profile.status && (
              <DetailRow icon={User} label="Status" value={profile.status} />
            )}
            {profile.role === 'faculty' && profile.subjects && profile.subjects.length > 0 && (
              <DetailRow icon={GraduationCap} label="Subjects" value={profile.subjects.join(', ')} />
            )}
            {profile.rollNumber && (
              <DetailRow icon={GraduationCap} label="Roll Number" value={profile.rollNumber} />
            )}
            {profile.branch && (
              <DetailRow icon={Building2} label="Branch" value={profile.branch} />
            )}
            {profile.semester != null && (
              <DetailRow icon={User} label="Semester" value={`Semester ${profile.semester}`} />
            )}
          </div>

          <p className="text-[11px] text-center text-slate-400 leading-relaxed">
            Verified CampusSync {profile.role === 'faculty' ? 'faculty' : 'student'} profile · For college gate entry only
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-[#5B4FCF] mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 break-all">{value}</p>
      </div>
    </div>
  );
}

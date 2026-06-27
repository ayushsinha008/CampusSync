'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Mail,
  User,
  GraduationCap,
  Building2,
  CalendarDays,
  LogOut,
  QrCode,
  ShieldCheck,
  Hash,
  Layers,
  Sparkles,
  Camera,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import { Panel } from '@/components/Panel';

type ProfileData = {
  name: string;
  email: string;
  image?: string;
  role: 'student' | 'staff';
  rollNumber?: string;
  branch?: string;
  semester?: number;
  createdAt?: string;
  entryToken?: string;
  entryUrl?: string;
};

function InfoRow({
  icon: Icon,
  label,
  value,
  accent = 'purple',
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: 'purple' | 'blue' | 'emerald' | 'amber';
}) {
  const accents = {
    purple: 'bg-brand-muted text-brand',
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-muted px-4 py-3.5">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accents[accent]}`}>
        <Icon className="h-4 w-4" strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-[15px] font-semibold text-foreground">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [entryUrl, setEntryUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load profile');
        setProfile(data);
        if (data.entryToken && typeof window !== 'undefined') {
          setEntryUrl(`${window.location.origin}/entry/${data.entryToken}`);
        } else if (data.entryUrl) {
          setEntryUrl(data.entryUrl);
        }
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (profile?.image && profile.image !== session?.user?.image) {
      updateSession({ image: profile.image });
    }
  }, [profile?.image, session?.user?.image, updateSession]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a JPG or PNG image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      setProfile((prev) => (prev ? { ...prev, image: data.image } : prev));
      await updateSession({ image: data.image });
      toast.success('Profile photo saved to your account');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const avatarSrc = profile?.image || session?.user?.image || undefined;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-5 pb-12">
        <Skeleton className="h-[220px] rounded-2xl" />
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-[420px] rounded-2xl" />
          <Skeleton className="h-[420px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-5xl py-20 text-center text-slate-500">
        Could not load profile. Please refresh the page.
      </div>
    );
  }

  const isStaff = profile.role === 'staff';
  const initials = profile.name?.[0]?.toUpperCase() || 'U';

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-heading">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your campus identity, account details and entry pass</p>
      </div>

      <Panel className="overflow-hidden p-0">
        <div className="relative bg-gradient-to-br from-[#1C1A3A] via-[#2D2B52] to-[#5B4FCF] px-5 pt-5 pb-8 sm:px-8 sm:pb-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-[#8B7CF6]/30 blur-3xl" />

          <div className="relative flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              CampusSync Verified
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              Log Out
            </Button>
          </div>

          <div className="relative mt-8 flex flex-col items-center gap-5 sm:mt-10 sm:flex-row sm:items-center sm:gap-6">
            <div className="relative shrink-0">
              <Avatar className="h-[100px] w-[100px] border-4 border-white/90 shadow-[0_16px_40px_rgba(0,0,0,0.25)] sm:h-[112px] sm:w-[112px]">
                <AvatarImage src={avatarSrc} alt={profile.name} />
                <AvatarFallback className="bg-[#EEEAFD] text-[#5B4FCF] text-4xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#5B4FCF] text-white shadow-lg transition hover:bg-[#4a41b8] disabled:opacity-60"
                aria-label="Upload profile photo"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h2 className="text-[28px] font-bold leading-tight tracking-tight text-white sm:text-[32px]">
                {profile.name}
              </h2>
              <p className="mt-2 flex items-center justify-center gap-2 text-sm text-white/80 sm:justify-start">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </p>
              <p className="mt-2 text-xs text-white/60">Tap camera icon to upload photo · saved permanently</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#5B4FCF]">
                  {isStaff ? 'Organization Admin' : 'Student'}
                </span>
                {profile.createdAt && (
                  <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                    <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                    Joined {format(new Date(profile.createdAt), 'MMM yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {!isStaff && (
          <div className="grid grid-cols-1 divide-y divide-border border-t border-white/10 bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-muted">
                <Hash className="h-4 w-4 text-brand" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Roll Number</p>
                <p className="truncate text-base font-bold text-foreground">{profile.rollNumber || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                <Building2 className="h-4 w-4 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Branch</p>
                <p className="truncate text-base font-bold text-foreground">{profile.branch || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Semester</p>
                <p className="text-base font-bold text-foreground">
                  {profile.semester ? `Semester ${profile.semester}` : '—'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Panel>

      <div className={`grid gap-5 ${!isStaff && entryUrl ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
        {/* Account details */}
        <Panel className="p-5 sm:p-6">
          <div className="mb-5">
            <h3 className="text-[15px] font-bold text-heading">Account Details</h3>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Registered campus information (read-only)</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow icon={User} label="Full Name" value={profile.name} accent="purple" />
            <InfoRow icon={Mail} label="Email Address" value={profile.email} accent="blue" />
            {!isStaff && (
              <>
                <InfoRow icon={Hash} label="Roll Number" value={profile.rollNumber || ''} accent="emerald" />
                <InfoRow icon={Building2} label="Branch" value={profile.branch || ''} accent="amber" />
                <InfoRow icon={GraduationCap} label="Semester" value={profile.semester ? String(profile.semester) : ''} accent="purple" />
                <InfoRow icon={Layers} label="Account Type" value="Student" accent="blue" />
              </>
            )}
          </div>

          {isStaff && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-brand/15 bg-brand-muted/40 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                <Building2 className="h-4 w-4 text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Organization Admin</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  Manage notices, assignments, attendance and student records across the campus portal.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end border-t border-border pt-5">
            <Button
              type="button"
              variant="outline"
              className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </Panel>

        {/* QR Pass */}
        {!isStaff && entryUrl && (
          <Panel className="overflow-hidden bg-gradient-to-b from-brand-muted/50 to-card p-5 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10">
                <QrCode className="h-5 w-5 text-brand" />
              </div>
              <h3 className="text-[15px] font-bold text-heading">College Entry Pass</h3>
              <p className="mt-1 text-[12px] font-medium text-brand">Scan at the campus gate</p>

              <Avatar className="mt-5 h-20 w-20 border-4 border-card shadow-md">
                <AvatarImage src={avatarSrc} alt={profile.name} />
                <AvatarFallback className="bg-brand-muted text-brand text-2xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <p className="mt-2 text-sm font-semibold text-foreground">{profile.name}</p>

              <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <QRCode value={entryUrl} size={176} level="M" />
              </div>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Unique & secure
              </div>

              {profile.rollNumber && (
                <p className="mt-3 font-mono text-[11px] text-muted-foreground">{profile.rollNumber}</p>
              )}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

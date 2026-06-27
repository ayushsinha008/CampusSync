'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Search, Users, ExternalLink, ArrowLeft, ShieldAlert, ShieldCheck,
  UserX, Clock, AlertTriangle, Trash2, Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VerificationStatusDonut } from '@/components/admin/ChartKit';
import { format } from 'date-fns';

const JOINED_KEY = 'campussync-codezen-joined';

type PublicOrg = {
  _id: string;
  name: string;
  tagline?: string;
  category: string;
  description: string;
  logo?: string;
  website?: string;
  members: number;
};

type AdminOrgRow = {
  _id: string;
  name: string;
  category: string;
  tagline?: string;
  status: string;
  logo?: string;
  stats: { total: number; verified: number; fake: number; suspicious: number; pending: number };
};

type MemberRow = {
  _id: string;
  name: string;
  email: string;
  rollNumber?: string;
  branch?: string;
  status: 'verified' | 'fake' | 'pending' | 'suspicious';
  flagReason?: string;
  joinedAt: string;
};

function Panel({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </div>
  );
}

function statusBadge(status: string) {
  switch (status) {
    case 'verified':
      return 'bg-emerald-50 text-emerald-700 border-0';
    case 'fake':
      return 'bg-red-50 text-red-600 border-0';
    case 'suspicious':
      return 'bg-amber-50 text-amber-700 border-0';
    default:
      return 'bg-slate-100 text-slate-600 border-0';
  }
}

function scrollMainToTop() {
  document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function OrganizationsPage() {
  const { data: session, status } = useSession();
  const isStaff = (session?.user as { role?: string })?.role === 'staff';

  if (status === 'loading') return <Skeleton className="h-96 rounded-2xl" />;
  if (isStaff) return <AdminOrganizations />;
  return <StudentOrganizations />;
}

function StudentOrganizations() {
  const [orgs, setOrgs] = useState<PublicOrg[]>([]);
  const [joined, setJoined] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'discover' | 'my'>('discover');

  useEffect(() => {
    try {
      setJoined(localStorage.getItem(JOINED_KEY) === 'true');
    } catch {
      // ignore
    }
    fetch('/api/organizations')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrgs(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const markJoined = () => {
    try {
      localStorage.setItem(JOINED_KEY, 'true');
    } catch {
      // ignore
    }
    setJoined(true);
  };

  const filtered = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const display = tab === 'my' ? (joined ? filtered : []) : filtered;

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Organizations</h1>
          <p className="text-sm text-slate-500 mt-1">Discover and join campus clubs and societies.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search organizations..."
            className="pl-9 w-full sm:w-[250px] rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {(['discover', 'my'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors',
              tab === t ? 'border-[#5B4FCF] text-[#5B4FCF]' : 'border-transparent text-slate-500'
            )}
          >
            {t === 'discover' ? 'Discover' : 'My Organizations'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {display.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            {tab === 'my' && !joined
              ? "You haven't joined any organizations yet."
              : 'No organizations match your search.'}
          </div>
        ) : (
          display.map((org) => (
            <Panel key={org._id} className="overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-14 w-14 rounded-xl border border-slate-100 bg-white overflow-hidden flex items-center justify-center p-1">
                    {org.logo ? (
                      <Image src={org.logo} alt={org.name} width={52} height={52} className="object-contain" />
                    ) : (
                      <Building2 className="h-8 w-8 text-[#5B4FCF]" />
                    )}
                  </div>
                  <Badge className="bg-[#EEEAFD] text-[#5B4FCF] border-0">{org.category}</Badge>
                </div>
                <h3 className="text-lg font-bold text-[#1E293B]">{org.name}</h3>
                {org.tagline && <p className="text-xs font-semibold text-[#5B4FCF] mt-1">{org.tagline}</p>}
                <p className="flex items-center text-sm text-slate-500 mt-2">
                  <Users className="h-4 w-4 mr-1.5" />
                  {org.members.toLocaleString()} members
                </p>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">{org.description}</p>
              </div>
              {org.website && (
                <div className="p-5 pt-0">
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={markJoined}
                    className="flex items-center justify-center w-full h-11 rounded-xl font-semibold bg-[#5B4FCF] hover:bg-[#4B3FBF] text-white text-sm no-underline"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {joined ? `Visit ${org.name}` : `Join ${org.name}`}
                  </a>
                </div>
              )}
            </Panel>
          ))
        )}
      </div>
    </div>
  );
}

function AdminOrganizations() {
  const [orgs, setOrgs] = useState<AdminOrgRow[]>([]);
  const [totals, setTotals] = useState({ organizations: 0, members: 0, verified: 0, fake: 0, pending: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    organization: { _id: string; name: string; category: string; tagline?: string; logo?: string };
    members: MemberRow[];
    stats: AdminOrgRow['stats'];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState<'all' | 'verified' | 'fake' | 'suspicious' | 'pending'>('all');

  const loadOrgs = () => {
    fetch('/api/staff/organizations')
      .then((res) => res.json())
      .then((data) => {
        if (data.organizations) {
          setOrgs(data.organizations);
          setTotals(data.totals);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    fetch(`/api/staff/organizations/${selectedId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.message) setDetail(data);
      })
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const updateMember = async (memberId: string, newStatus: MemberRow['status']) => {
    const res = await fetch(`/api/staff/organizations/members/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(`Member marked as ${newStatus}`);
      if (selectedId) {
        fetch(`/api/staff/organizations/${selectedId}`)
          .then((r) => r.json())
          .then((data) => {
            if (!data.message) setDetail(data);
          });
        loadOrgs();
      }
    }
  };

  const removeMember = async (memberId: string) => {
    const res = await fetch(`/api/staff/organizations/members/${memberId}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Member removed');
      if (selectedId) {
        fetch(`/api/staff/organizations/${selectedId}`)
          .then((r) => r.json())
          .then((data) => {
            if (!data.message) setDetail(data);
          });
        loadOrgs();
      }
    }
  };

  const filteredOrgs = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  if (selectedId) {
    const fakeMembers = detail?.members.filter((m) => m.status === 'fake' || m.status === 'suspicious') ?? [];
    const filteredMembers =
      detail?.members.filter((m) => memberFilter === 'all' || m.status === memberFilter) ?? [];

    return (
      <div className="max-w-4xl mx-auto space-y-5 pb-12">
        <button
          type="button"
          onClick={() => { setSelectedId(null); scrollMainToTop(); }}
          className="inline-flex items-center text-sm font-bold text-[#5B4FCF] hover:bg-[#EEEAFD] rounded-xl px-3 py-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all organizations
        </button>

        {detailLoading || !detail ? (
          <Skeleton className="h-[500px] rounded-2xl" />
        ) : (
          <>
            <Panel className="p-5">
              <div className="flex items-center gap-4">
                {detail.organization.logo && (
                  <Image src={detail.organization.logo} alt="" width={48} height={48} className="rounded-xl" />
                )}
                <div>
                  <h1 className="text-xl font-bold text-[#1E293B]">{detail.organization.name}</h1>
                  <p className="text-sm text-slate-500">{detail.organization.category}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
                {[
                  { label: 'Total', value: detail.stats.total },
                  { label: 'Verified', value: detail.stats.verified },
                  { label: 'Fake', value: detail.stats.fake },
                  { label: 'Suspicious', value: detail.stats.suspicious },
                  { label: 'Pending', value: detail.stats.pending },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-[#F5F6FA] px-3 py-3 text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400">{s.label}</p>
                    <p className="text-lg font-bold text-[#1E293B]">{s.value}</p>
                  </div>
                ))}
              </div>
            </Panel>

            {fakeMembers.length > 0 && (
              <Panel className="p-5 border-red-200 bg-red-50/30">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  <h3 className="font-bold text-red-700">Flagged / Fake Members ({fakeMembers.length})</h3>
                </div>
                <ul className="space-y-2">
                  {fakeMembers.map((m) => (
                    <li key={m._id} className="flex items-start justify-between gap-3 rounded-xl bg-white border border-red-100 px-4 py-3">
                      <div>
                        <p className="font-semibold text-sm text-[#1E293B]">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.email}</p>
                        {m.flagReason && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> {m.flagReason}
                          </p>
                        )}
                      </div>
                      <Badge className={statusBadge(m.status)}>{m.status}</Badge>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            <Panel className="overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-[#1E293B]">All Members</h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(['all', 'verified', 'fake', 'suspicious', 'pending'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setMemberFilter(f)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors',
                        memberFilter === f ? 'bg-[#5B4FCF] text-white' : 'bg-slate-100 text-slate-600 hover:bg-[#EEEAFD]'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredMembers.length === 0 ? (
                  <p className="p-8 text-center text-slate-400 text-sm">No members in this filter</p>
                ) : (
                  filteredMembers.map((m) => (
                    <div
                      key={m._id}
                      className={cn(
                        'flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4',
                        (m.status === 'fake' || m.status === 'suspicious') && 'bg-red-50/40'
                      )}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className={cn(
                          'text-xs font-bold',
                          m.status === 'fake' ? 'bg-red-100 text-red-600' : 'bg-[#EEEAFD] text-[#5B4FCF]'
                        )}>
                          {m.name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-[#1E293B]">{m.name}</p>
                        <p className="text-xs text-slate-500 truncate">{m.email}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {m.rollNumber || 'No roll'} · {m.branch || 'No branch'} · Joined {format(new Date(m.joinedAt), 'dd MMM yyyy')}
                        </p>
                        {m.flagReason && (
                          <p className="text-xs text-red-600 mt-1">{m.flagReason}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Badge className={statusBadge(m.status)}>{m.status}</Badge>
                        {m.status !== 'verified' && (
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => updateMember(m._id, 'verified')}>
                            <ShieldCheck className="h-3 w-3 mr-1" /> Verify
                          </Button>
                        )}
                        {m.status !== 'fake' && (
                          <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200" onClick={() => updateMember(m._id, 'fake')}>
                            <UserX className="h-3 w-3 mr-1" /> Mark Fake
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500" onClick={() => removeMember(m._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Organization Management</h1>
        <p className="text-sm text-slate-500 mt-1">Review campus clubs, verify members & flag fake accounts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Organizations', value: totals.organizations, icon: Building2 },
          { label: 'Total Members', value: totals.members, icon: Users },
          { label: 'Verified', value: totals.verified, icon: ShieldCheck },
          { label: 'Fake / Flagged', value: totals.fake, icon: ShieldAlert },
        ].map((item) => (
          <Panel key={item.label} className="p-4">
            <item.icon className="h-4 w-4 text-[#5B4FCF] mb-2" />
            <p className="text-[10px] font-bold uppercase text-slate-400">{item.label}</p>
            <p className="text-2xl font-bold text-[#1E293B]">{item.value}</p>
          </Panel>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="search"
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4FCF]/20"
        />
      </div>

      <Panel className="divide-y divide-slate-100 overflow-hidden">
        {filteredOrgs.length === 0 ? (
          <p className="p-8 text-center text-slate-400 text-sm">No organizations found</p>
        ) : (
          filteredOrgs.map((org) => (
            <button
              key={org._id}
              type="button"
              onClick={() => { setSelectedId(org._id); scrollMainToTop(); }}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#F5F6FA] active:bg-[#EEEAFD] transition-colors"
            >
              {org.logo ? (
                <Image src={org.logo} alt="" width={48} height={48} className="rounded-xl shrink-0" />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-[#EEEAFD] flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-[#5B4FCF]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#1E293B]">{org.name}</p>
                <p className="text-xs text-slate-500">{org.category} · {org.stats.total} members</p>
                <div className="mt-1.5 flex flex-wrap gap-2 text-[11px]">
                  <span className="text-emerald-600 font-semibold">{org.stats.verified} verified</span>
                  {(org.stats.fake + org.stats.suspicious) > 0 && (
                    <span className="text-red-600 font-semibold">{org.stats.fake + org.stats.suspicious} fake/flagged</span>
                  )}
                  {org.stats.pending > 0 && (
                    <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                      <Clock className="h-3 w-3" /> {org.stats.pending} pending
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </Panel>

      {totals.members > 0 && (
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#1E293B]">Organization Analytics</h2>
            <p className="text-sm text-slate-500 mt-0.5">Member verification breakdown across all clubs</p>
          </div>
          <VerificationStatusDonut
            title="Member Verification Overview"
            subtitle="Across all campus organizations"
            segments={[
              { name: 'Verified', value: totals.verified, color: '#10B981' },
              { name: 'Fake / Flagged', value: totals.fake, color: '#F43F5E' },
              { name: 'Pending', value: totals.pending, color: '#94A3B8' },
            ]}
          />
        </div>
      )}
    </div>
  );
}

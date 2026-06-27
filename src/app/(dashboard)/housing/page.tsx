'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Home, Users, Wrench, Info, MapPin, Search, ShieldAlert, ShieldCheck,
  UserX, Clock, AlertTriangle, Trash2, Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { VerificationStatusDonut } from '@/components/admin/ChartKit';
import { cn } from '@/lib/utils';

type Assignment = {
  building: string;
  location: string;
  room: string;
  roomType: string;
  status: string;
  term: string;
  roommateName?: string;
  roommateMajor?: string;
};

type Request = { ticketId: string; category: string; description: string; status: string };

type HousingRow = {
  _id: string;
  studentName: string;
  studentEmail?: string;
  rollNumber?: string;
  branch?: string;
  building: string;
  location: string;
  room: string;
  roomType: string;
  status: string;
  term: string;
  roommateName?: string;
  verificationStatus: 'verified' | 'fake' | 'suspicious' | 'pending';
  flagReason?: string;
  studentId?: string;
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

export default function HousingPage() {
  const { data: session, status } = useSession();
  const isStaff = (session?.user as { role?: string })?.role === 'staff';

  if (status === 'loading') return <Skeleton className="h-96 rounded-2xl" />;
  if (isStaff) return <AdminHousing />;
  return <StudentHousing />;
}

function StudentHousing() {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [category, setCategory] = useState('Plumbing');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const loadHousing = () => {
    fetch('/api/housing')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setAssignment(data.assignment);
        setRequests(data.requests);
      })
      .catch(() => toast.error('Failed to load housing data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHousing();
  }, []);

  const handleSubmitMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/housing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, description }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`Maintenance request submitted. Ticket #${data.ticketId} created.`);
      setDescription('');
      loadHousing();
    } else {
      toast.error(data.message || 'Failed to submit request');
    }
  };

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  if (!assignment) {
    return (
      <div className="text-center py-20 text-slate-500">
        No hostel assignment found. Contact the warden office.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Housing & Residence Life</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your hostel assignment and submit maintenance requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-blue-500" />
            <CardContent className="p-6 relative">
              <div className="absolute -top-12 left-6 bg-white p-4 rounded-2xl shadow-md border border-slate-100">
                <Home className="h-10 w-10 text-indigo-600" />
              </div>
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-slate-800">{assignment.building}</h2>
                <div className="flex items-center text-slate-500 mt-1 mb-6">
                  <MapPin className="h-4 w-4 mr-1" /> {assignment.location}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Room</p>
                    <p className="text-lg font-bold text-slate-800">{assignment.room}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Type</p>
                    <p className="text-lg font-bold text-slate-800">{assignment.roomType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Status</p>
                    <p className="text-lg font-bold text-emerald-600">{assignment.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Term</p>
                    <p className="text-lg font-bold text-slate-800">{assignment.term}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {assignment.roommateName && (
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-indigo-500" /> Roommate
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl">
                  <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                    {assignment.roommateName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{assignment.roommateName}</h4>
                    <p className="text-sm text-slate-500">{assignment.roommateMajor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {requests.length > 0 && (
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Maintenance Requests</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {requests.map((r) => (
                  <div key={r.ticketId} className="py-3 flex justify-between text-sm">
                    <div>
                      <span className="font-mono text-slate-500">{r.ticketId}</span>
                      <span className="ml-2 text-slate-800">{r.category}</span>
                      <p className="text-slate-500 mt-1">{r.description}</p>
                    </div>
                    <span className="text-emerald-600 font-medium">{r.status}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <Wrench className="mr-2 h-5 w-5 text-amber-500" /> Maintenance Request
              </CardTitle>
              <CardDescription>Report an issue in your room.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitMaintenance} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>Wi-Fi / Internet</option>
                    <option>Furniture</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue..."
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none h-24 text-slate-900"
                  />
                </div>
                <Button type="submit" className="w-full bg-[#1C1A3A] hover:bg-[#2D2B52] text-white">
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-blue-200 bg-blue-50 shadow-sm mt-6">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">Vacation Notice</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Summer vacation hostel vacate date: 15 May 2026. Room must be cleared by 18 May, 12:00 PM.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AdminHousing() {
  const [assignments, setAssignments] = useState<HousingRow[]>([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, fake: 0, suspicious: 0, pending: 0, openTickets: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'fake' | 'suspicious' | 'pending'>('all');

  const load = () => {
    fetch('/api/staff/housing')
      .then((res) => res.json())
      .then((data) => {
        if (data.assignments) {
          setAssignments(data.assignments);
          setStats(data.stats);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, verificationStatus: HousingRow['verificationStatus']) => {
    const res = await fetch(`/api/staff/housing/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationStatus }),
    });
    if (res.ok) {
      toast.success(`Marked as ${verificationStatus}`);
      load();
    }
  };

  const removeAssignment = async (id: string) => {
    const res = await fetch(`/api/staff/housing/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Assignment removed');
      load();
    }
  };

  const fakeRows = assignments.filter((a) => a.verificationStatus === 'fake' || a.verificationStatus === 'suspicious');

  const filtered = assignments.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      a.studentName.toLowerCase().includes(q) ||
      (a.studentEmail || '').toLowerCase().includes(q) ||
      (a.rollNumber || '').toLowerCase().includes(q) ||
      a.building.toLowerCase().includes(q) ||
      a.room.toLowerCase().includes(q);
    const matchesFilter = filter === 'all' || a.verificationStatus === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Housing & Dorms Management</h1>
        <p className="text-sm text-slate-500 mt-1">Review hostel assignments, flag fake occupants & verify rooms</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Building2 },
          { label: 'Verified', value: stats.verified, icon: ShieldCheck },
          { label: 'Fake', value: stats.fake, icon: ShieldAlert },
          { label: 'Suspicious', value: stats.suspicious, icon: AlertTriangle },
          { label: 'Pending', value: stats.pending, icon: Clock },
        ].map((item) => (
          <Panel key={item.label} className="p-4">
            <item.icon className="h-4 w-4 text-[#5B4FCF] mb-2" />
            <p className="text-[10px] font-bold uppercase text-slate-400">{item.label}</p>
            <p className="text-2xl font-bold text-[#1E293B]">{item.value}</p>
          </Panel>
        ))}
      </div>

      {fakeRows.length > 0 && (
        <Panel className="p-5 border-red-200 bg-red-50/30">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <h3 className="font-bold text-red-700">Fake / Flagged Hostel Assignments ({fakeRows.length})</h3>
          </div>
          <ul className="space-y-2">
            {fakeRows.map((a) => (
              <li key={a._id} className="rounded-xl bg-white border border-red-100 px-4 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-[#1E293B]">{a.studentName}</p>
                    <p className="text-xs text-slate-500">
                      {a.building} · Room {a.room} · {a.studentEmail || 'No email'}
                    </p>
                    {a.flagReason && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {a.flagReason}
                      </p>
                    )}
                  </div>
                  <Badge className={statusBadge(a.verificationStatus)}>{a.verificationStatus}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="search"
          placeholder="Search by name, email, roll, building or room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4FCF]/20"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'verified', 'fake', 'suspicious', 'pending'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors',
              filter === f ? 'bg-[#5B4FCF] text-white' : 'bg-slate-100 text-slate-600 hover:bg-[#EEEAFD]'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <Panel className="divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-slate-400 text-sm">No assignments found</p>
        ) : (
          filtered.map((a) => (
            <div
              key={a._id}
              className={cn(
                'flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4',
                (a.verificationStatus === 'fake' || a.verificationStatus === 'suspicious') && 'bg-red-50/40'
              )}
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className={cn(
                  'text-xs font-bold',
                  a.verificationStatus === 'fake' ? 'bg-red-100 text-red-600' : 'bg-[#EEEAFD] text-[#5B4FCF]'
                )}>
                  {a.studentName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-[#1E293B]">{a.studentName}</p>
                <p className="text-xs text-slate-500">{a.studentEmail || '—'} · {a.rollNumber || 'No roll'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  <Home className="inline h-3 w-3 mr-0.5" />
                  {a.building}, Room {a.room} ({a.roomType}) · {a.term}
                </p>
                {a.flagReason && <p className="text-xs text-red-600 mt-1">{a.flagReason}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Badge className={statusBadge(a.verificationStatus)}>{a.verificationStatus}</Badge>
                {a.verificationStatus !== 'verified' && (
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => updateStatus(a._id, 'verified')}>
                    <ShieldCheck className="h-3 w-3 mr-1" /> Verify
                  </Button>
                )}
                {a.verificationStatus !== 'fake' && (
                  <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200" onClick={() => updateStatus(a._id, 'fake')}>
                    <UserX className="h-3 w-3 mr-1" /> Mark Fake
                  </Button>
                )}
                {!a.studentId && (
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500" onClick={() => removeAssignment(a._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </Panel>

      <div className="pt-4 border-t border-slate-200 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#1E293B]">Housing Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">Hostel occupancy verification breakdown</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <VerificationStatusDonut
            title="Assignment Verification"
            subtitle="Hostel occupancy audit breakdown"
            segments={[
              { name: 'Verified', value: stats.verified, color: '#10B981' },
              { name: 'Fake', value: stats.fake, color: '#F43F5E' },
              { name: 'Suspicious', value: stats.suspicious, color: '#F59E0B' },
              { name: 'Pending', value: stats.pending, color: '#94A3B8' },
            ]}
          />
          <Panel className="p-5 flex flex-col justify-center">
            <h3 className="font-bold text-[#1E293B] mb-2">Audit Summary</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {stats.fake + stats.suspicious} flagged assignment(s) need review.
              Verified students have matching roll numbers in the registry.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-red-50 px-4 py-3 text-center">
                <p className="text-xl font-bold text-red-600">{stats.fake}</p>
                <p className="text-[10px] text-red-500 font-semibold">FAKE</p>
              </div>
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center">
                <p className="text-xl font-bold text-emerald-600">{stats.verified}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">VERIFIED</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

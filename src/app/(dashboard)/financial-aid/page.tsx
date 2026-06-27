'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IndianRupee, FileCheck, Landmark, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { toast } from 'sonner';

type Award = {
  _id: string;
  name: string;
  amount: number;
  type: 'Grant' | 'Scholarship' | 'Loan';
  status: 'Accepted' | 'Offered' | 'Declined';
};

export default function FinancialAidPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [totalAccepted, setTotalAccepted] = useState(0);
  const [totalOffered, setTotalOffered] = useState(0);
  const [fafsaNote, setFafsaNote] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAwards = () => {
    fetch('/api/financial-aid')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setAwards(data.awards);
        setTotalAccepted(data.totalAccepted);
        setTotalOffered(data.totalOffered);
        setFafsaNote(data.fafsaNote);
      })
      .catch(() => toast.error('Failed to load financial aid'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAwards();
  }, []);

  const updateAward = async (id: string, status: 'Accepted' | 'Declined') => {
    const res = await fetch('/api/financial-aid', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast.success(status === 'Accepted' ? 'Award accepted' : 'Award declined');
      loadAwards();
    } else {
      toast.error('Failed to update award');
    }
  };

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  const offeredCount = awards.filter((a) => a.status === 'Offered').length;

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Financial Aid & Scholarships</h1>
        <p className="text-sm text-slate-500 mt-1">Review your scholarships and aid for academic year 2025-26 (INR).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center py-4">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3 border border-emerald-200">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">Your Awards</CardTitle>
                <CardDescription>Scholarships, grants and loans offered to you.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
              {awards.map((award) => (
                <div key={award._id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 text-lg">{award.name}</h3>
                      <Badge variant="outline">{award.type}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Amount: {formatINR(award.amount)}</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {award.status === 'Accepted' ? (
                      <span className="flex items-center text-emerald-600 font-semibold text-sm bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100">
                        <FileCheck className="h-4 w-4 mr-2" /> Accepted
                      </span>
                    ) : award.status === 'Declined' ? (
                      <span className="text-slate-500 text-sm">Declined</span>
                    ) : (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button className="bg-[#1C1A3A] text-white" onClick={() => updateAward(award._id, 'Accepted')}>Accept</Button>
                        <Button variant="outline" onClick={() => updateAward(award._id, 'Declined')}>Decline</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm bg-[#1C1A3A] text-white">
            <CardContent className="p-6">
              <h3 className="text-indigo-200 font-medium mb-1">Total Aid Accepted</h3>
              <div className="text-4xl font-bold mb-4">{formatINR(totalAccepted)}</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-indigo-100">
                  <span>Accepted vs Offered</span>
                  <span>{totalOffered > 0 ? Math.round((totalAccepted / totalOffered) * 100) : 0}%</span>
                </div>
                <Progress value={totalOffered > 0 ? (totalAccepted / totalOffered) * 100 : 0} className="h-2 bg-indigo-900" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <Landmark className="mr-2 h-5 w-5 text-slate-500" /> Application Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Application Received</h4>
                  <p className="text-xs text-slate-500 mt-1">{fafsaNote}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {offeredCount > 0 && (
            <Card className="rounded-2xl border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800 text-sm">Action Required</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    You have {offeredCount} unaccepted offer(s). Please review and accept/decline before the deadline.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

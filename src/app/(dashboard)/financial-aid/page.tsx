'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DollarSign, FileCheck, Landmark, AlertCircle, CheckCircle2 } from 'lucide-react';

const AWARDS = [
  { id: 1, name: 'Federal Pell Grant', amount: 3200, status: 'Accepted', type: 'Grant' },
  { id: 2, name: 'University Merit Scholarship', amount: 5000, status: 'Accepted', type: 'Scholarship' },
  { id: 3, name: 'Direct Subsidized Loan', amount: 2500, status: 'Offered', type: 'Loan' },
];

export default function FinancialAidPage() {
  const totalAccepted = AWARDS.filter(a => a.status === 'Accepted').reduce((sum, a) => sum + a.amount, 0);
  const totalOffered = AWARDS.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Financial Aid</h1>
          <p className="text-sm text-slate-500 mt-1">Review your awards, scholarships, and FAFSA status for the 2023-2024 academic year.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center py-4">
              <div className="bg-emerald-100 p-2 rounded-lg mr-3 border border-emerald-200">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">Your Awards</CardTitle>
                <CardDescription>Grants, scholarships, and loans offered to you.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
              {AWARDS.map(award => (
                <div key={award.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 text-lg">{award.name}</h3>
                      <Badge variant="outline" className={`
                        ${award.type === 'Grant' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${award.type === 'Scholarship' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}
                        ${award.type === 'Loan' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                      `}>
                        {award.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Amount: ${award.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {award.status === 'Accepted' ? (
                      <span className="flex items-center text-emerald-600 font-semibold text-sm bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100 w-full sm:w-auto justify-center">
                        <FileCheck className="h-4 w-4 mr-2" /> Accepted
                      </span>
                    ) : (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button className="bg-[#1C1A3A] text-white hover:bg-[#2D2B52] flex-1 sm:flex-none">Accept</Button>
                        <Button variant="outline" className="flex-1 sm:flex-none">Decline</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm bg-[#1C1A3A] text-white">
            <CardContent className="p-6">
              <h3 className="text-indigo-200 font-medium mb-1">Total Aid Accepted</h3>
              <div className="text-4xl font-bold mb-4">${totalAccepted.toLocaleString()}</div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-indigo-100">
                  <span>Accepted vs Offered</span>
                  <span>{Math.round((totalAccepted / totalOffered) * 100)}%</span>
                </div>
                <Progress value={(totalAccepted / totalOffered) * 100} className="h-2 bg-indigo-900" />
              </div>
              
              <p className="text-xs text-indigo-300 mt-4 leading-relaxed">
                Accepted funds will automatically be applied to your tuition balance at the start of the semester.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <Landmark className="mr-2 h-5 w-5 text-slate-500" /> FAFSA Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Application Received</h4>
                  <p className="text-xs text-slate-500 mt-1">Your 2023-2024 FAFSA was successfully processed on April 12, 2023. No further action is required at this time.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 text-sm">Action Required</h4>
                <p className="text-xs text-amber-700 mt-1">
                  You have 1 unaccepted offer (Direct Subsidized Loan). Please review and accept/decline by August 1st.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

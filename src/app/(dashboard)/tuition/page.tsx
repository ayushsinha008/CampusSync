import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function PlaceholderPage() {
  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tuition & Fees</h1>
          <p className="text-sm text-slate-500 mt-1">This module is currently under development.</p>
        </div>
      </div>

      <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center h-[500px] text-center">
          <div className="bg-amber-50 p-6 rounded-full mb-6">
            <Construction className="h-12 w-12 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Coming Soon</h2>
          <p className="text-slate-500 max-w-md">
            The Tuition & Fees feature is currently being built by our team. Check back soon for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

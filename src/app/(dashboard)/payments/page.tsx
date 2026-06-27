'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Download, PlusCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR } from '@/lib/currency';

type PaymentRow = {
  _id: string;
  transactionId: string;
  date: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending';
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPayments = () => {
    fetch('/api/payments')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setPayments(data.payments);
        setPendingAmount(data.pendingAmount);
        setDueDate(data.dueDate);
      })
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handlePayNow = async () => {
    setIsPaying(true);
    try {
      const res = await fetch('/api/payments', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPayments(data.payments);
      setPendingAmount(data.pendingAmount);
      toast.success(`Payment of ${formatINR(pendingAmount)} processed successfully via UPI/Net Banking!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Payments & Billing</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your student account balance and transaction history (INR).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 rounded-2xl border-slate-200 shadow-sm bg-[#1C1A3A] text-white">
          <CardContent className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-indigo-200 font-medium mb-1">Current Balance Due</p>
              <h2 className="text-5xl font-bold tracking-tight">{formatINR(pendingAmount)}</h2>
              <p className="text-sm text-indigo-300 mt-2">Due by {dueDate}</p>
            </div>
            <Button
              className="bg-[#1C64F2] hover:bg-blue-600 text-white h-14 px-8 rounded-xl font-bold text-lg w-full md:w-auto"
              disabled={pendingAmount === 0 || isPaying}
              onClick={handlePayNow}
            >
              {isPaying ? 'Processing...' : pendingAmount === 0 ? 'All Settled' : 'Pay Now'}
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1 rounded-2xl border-slate-200 shadow-sm h-full">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-slate-500" /> Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
              <div className="flex items-center">
                <div className="bg-orange-100 w-10 h-6 rounded mr-3 flex items-center justify-center text-[9px] font-bold text-orange-700">UPI</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">ayush@upi</p>
                  <p className="text-xs text-slate-500">Primary</p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <Button variant="outline" className="w-full border-dashed border-slate-300 text-slate-600">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg font-bold text-slate-800">Transaction History</CardTitle>
          <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
            <Download className="mr-2 h-3.5 w-3.5" /> Download Statement
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Transaction ID</TableHead>
                <TableHead className="text-right font-semibold">Amount</TableHead>
                <TableHead className="text-right font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((trx) => (
                <TableRow key={trx._id}>
                  <TableCell className="font-medium text-slate-600">{new Date(trx.date).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell className="text-slate-800">{trx.description}</TableCell>
                  <TableCell className="text-slate-500 text-xs font-mono">{trx.transactionId}</TableCell>
                  <TableCell className="text-right font-semibold text-slate-800">{formatINR(trx.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={trx.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                      {trx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

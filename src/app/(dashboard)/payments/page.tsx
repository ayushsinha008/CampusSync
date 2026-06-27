'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, DollarSign, Download, PlusCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const TRANSACTIONS = [
  { id: 'TRX-9923', date: '2023-08-15', description: 'Fall Semester Tuition', amount: 12500, status: 'Paid' },
  { id: 'TRX-9924', date: '2023-08-15', description: 'Housing Deposit', amount: 800, status: 'Paid' },
  { id: 'TRX-10112', date: '2024-01-10', description: 'Spring Semester Tuition', amount: 12500, status: 'Pending' },
  { id: 'TRX-10115', date: '2024-01-12', description: 'Library Fine', amount: 25, status: 'Pending' },
];

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState(TRANSACTIONS);
  const [isPaying, setIsPaying] = useState(false);

  const pendingAmount = transactions
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const handlePayNow = () => {
    setIsPaying(true);
    setTimeout(() => {
      setTransactions(transactions.map(t => ({ ...t, status: 'Paid' })));
      setIsPaying(false);
      toast.success('Payment of $' + pendingAmount.toLocaleString() + ' processed successfully!');
    }, 1500);
  };

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Payments & Billing</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your student account balance and transaction history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card className="col-span-1 md:col-span-2 rounded-2xl border-slate-200 shadow-sm bg-[#1C1A3A] text-white">
          <CardContent className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-indigo-200 font-medium mb-1">Current Balance Due</p>
              <h2 className="text-5xl font-bold tracking-tight">${pendingAmount.toLocaleString()}</h2>
              <p className="text-sm text-indigo-300 mt-2">Due by January 30, 2024</p>
            </div>
            <Button 
              className="bg-[#1C64F2] hover:bg-blue-600 text-white h-14 px-8 rounded-xl font-bold text-lg w-full md:w-auto shadow-lg shadow-blue-500/20"
              disabled={pendingAmount === 0 || isPaying}
              onClick={handlePayNow}
            >
              {isPaying ? 'Processing...' : (pendingAmount === 0 ? 'All Settled' : 'Pay Now')}
            </Button>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="col-span-1 rounded-2xl border-slate-200 shadow-sm h-full">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-slate-500" /> Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
              <div className="flex items-center">
                <div className="bg-slate-200 w-10 h-6 rounded mr-3 flex items-center justify-center text-[10px] font-bold text-slate-600">VISA</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">•••• 4242</p>
                  <p className="text-xs text-slate-500">Expires 12/25</p>
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

      {/* Transaction History */}
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
                <TableHead className="w-[120px] font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Transaction ID</TableHead>
                <TableHead className="text-right font-semibold">Amount</TableHead>
                <TableHead className="text-right font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((trx) => (
                <TableRow key={trx.id}>
                  <TableCell className="font-medium text-slate-600">{new Date(trx.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-slate-800">{trx.description}</TableCell>
                  <TableCell className="text-slate-500 text-xs font-mono">{trx.id}</TableCell>
                  <TableCell className="text-right font-semibold text-slate-800">
                    ${trx.amount.toLocaleString()}
                  </TableCell>
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

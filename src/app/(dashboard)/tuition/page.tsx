'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, ArrowRight, Wallet } from 'lucide-react';
import Link from 'next/link';

const MOCK_FEES = [
  { id: 'FEE-1', item: 'Undergraduate Tuition (15 Credits)', amount: 12500, type: 'Tuition' },
  { id: 'FEE-2', item: 'Technology Fee', amount: 350, type: 'Mandatory Fee' },
  { id: 'FEE-3', item: 'Student Health Insurance', amount: 1200, type: 'Optional Fee' },
  { id: 'FEE-4', item: 'Library & Facilities Fee', amount: 200, type: 'Mandatory Fee' },
];

export default function TuitionPage() {
  const totalAmount = MOCK_FEES.reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tuition & Fees Breakdown</h1>
          <p className="text-sm text-slate-500 mt-1">Itemized statement for the current academic term (Fall 2023).</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white">
            <Download className="mr-2 h-4 w-4" /> Export Statement
          </Button>
          <Link href="/payments">
             <Button className="bg-[#1C1A3A] text-white">
               <Wallet className="mr-2 h-4 w-4" /> Go to Payments
             </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 rounded-2xl border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800">Fee Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white">
                <TableRow>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="text-right font-semibold">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_FEES.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium text-slate-800">{fee.item}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        {fee.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-700">
                      ${fee.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center">
            <span className="font-bold text-slate-700">Total Charges</span>
            <span className="text-xl font-bold text-[#1C1A3A]">${totalAmount.toLocaleString()}</span>
          </CardFooter>
        </Card>

        <Card className="col-span-1 rounded-2xl border-slate-200 shadow-sm bg-white h-fit">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-slate-500" /> Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Previous Balance</span>
              <span className="font-medium text-slate-800">$0</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Current Charges</span>
              <span className="font-medium text-slate-800">${totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-4">
              <span className="text-emerald-600">Financial Aid Applied</span>
              <span className="font-medium text-emerald-600">-$5,000</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-slate-800">Total Amount Due</span>
              <span className="text-2xl font-bold text-[#1C64F2]">${(totalAmount - 5000).toLocaleString()}</span>
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Link href="/payments" className="w-full">
              <Button className="w-full bg-[#1C64F2] hover:bg-blue-700 text-white shadow-md">
                Make a Payment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

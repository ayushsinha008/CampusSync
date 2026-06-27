'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Home, Users, Wrench, Info, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function HousingPage() {
  const handleSubmitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Maintenance request submitted successfully. Ticket #MR-8422 created.');
  };

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Housing & Residence Life</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your dorm assignment and submit maintenance requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
            <CardContent className="p-6 relative">
              <div className="absolute -top-12 left-6 bg-white p-4 rounded-2xl shadow-md border border-slate-100">
                <Home className="h-10 w-10 text-indigo-600" />
              </div>
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-slate-800">Centennial Hall</h2>
                <div className="flex items-center text-slate-500 mt-1 mb-6">
                  <MapPin className="h-4 w-4 mr-1" /> North Campus
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Room</p>
                    <p className="text-lg font-bold text-slate-800">412-B</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Type</p>
                    <p className="text-lg font-bold text-slate-800">Double</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Status</p>
                    <p className="text-lg font-bold text-emerald-600">Assigned</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Term</p>
                    <p className="text-lg font-bold text-slate-800">2023-2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <Users className="mr-2 h-5 w-5 text-indigo-500" /> Roommates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                    JD
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">John Doe</h4>
                    <p className="text-sm text-slate-500">Computer Science Major</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Message</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="lg:col-span-1 space-y-6">
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
                  <select id="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>Heating/Cooling</option>
                    <option>Furniture</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe the issue..." required className="resize-none h-24" />
                </div>
                <Button type="submit" className="w-full bg-[#1C1A3A] hover:bg-[#2D2B52] text-white">Submit Request</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-blue-200 bg-blue-50 shadow-sm">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">Move-out Information</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Spring semester move-out begins on May 15th. Please ensure your room is completely empty and clean by May 18th at 12:00 PM.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

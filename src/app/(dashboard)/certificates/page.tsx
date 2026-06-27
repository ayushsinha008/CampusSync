'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Download, ExternalLink, GraduationCap, Medal } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type Cert = {
  _id: string;
  title: string;
  issuer: string;
  awardedDate: string;
  type: 'academic' | 'professional' | 'honor';
};

const icons = { academic: Award, professional: ExternalLink, honor: Medal };

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/certificates')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setCertificates(data);
      })
      .catch(() => toast.error('Failed to load certificates'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Certificates & Awards</h1>
        <p className="text-sm text-slate-500 mt-1">Your academic honors and certifications stored in the database.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => {
          const Icon = icons[cert.type] || Award;
          return (
            <Card key={cert._id} className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className={`h-2 ${cert.type === 'academic' ? 'bg-indigo-500' : cert.type === 'honor' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <CardHeader className="pb-2">
                <div className={`p-3 rounded-xl w-fit mb-2 ${cert.type === 'academic' ? 'bg-indigo-50 text-indigo-600' : cert.type === 'honor' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-800 leading-tight">{cert.title}</CardTitle>
                <CardDescription className="font-medium text-slate-600">{cert.issuer}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-slate-500">
                  Awarded on: <span className="font-semibold text-slate-700">{format(new Date(cert.awardedDate), 'dd MMM yyyy')}</span>
                </p>
              </CardContent>
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
                <Button variant="outline" className="w-full font-medium" onClick={() => toast.success(`Downloading: ${cert.title}`)}>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-2xl border-indigo-200 bg-indigo-50/50 shadow-sm">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="bg-white p-4 rounded-full shadow-sm border border-indigo-100">
            <GraduationCap className="h-10 w-10 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Degree Certificate</h3>
            <p className="text-sm text-slate-600">Your official degree certificate will appear here after graduation requirements are completed and approved by the registrar.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

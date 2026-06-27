'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, ExternalLink, GraduationCap, Medal } from 'lucide-react';
import { toast } from 'sonner';

const CERTIFICATES = [
  { id: 1, title: "Dean's List - Fall 2023", issuer: 'College of Engineering', date: 'December 20, 2023', type: 'academic', icon: Award },
  { id: 2, title: 'Introduction to Cloud Computing', issuer: 'AWS Academy', date: 'October 15, 2023', type: 'professional', icon: ExternalLink },
  { id: 3, title: "President's Volunteer Service Award", issuer: 'University Administration', date: 'May 10, 2023', type: 'honor', icon: Medal },
];

export default function CertificatesPage() {
  const handleDownload = (title: string) => {
    toast.success(`Downloading certificate: ${title}`);
  };

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Certificates & Awards</h1>
          <p className="text-sm text-slate-500 mt-1">View and download your academic honors and professional certifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CERTIFICATES.map((cert) => {
          const Icon = cert.icon;
          return (
            <Card key={cert.id} className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className={`h-2 ${cert.type === 'academic' ? 'bg-indigo-500' : cert.type === 'honor' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-3 rounded-xl ${cert.type === 'academic' ? 'bg-indigo-50 text-indigo-600' : cert.type === 'honor' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-slate-800 leading-tight">{cert.title}</CardTitle>
                <CardDescription className="font-medium text-slate-600">{cert.issuer}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-slate-500">Awarded on: <span className="font-semibold text-slate-700">{cert.date}</span></p>
              </CardContent>
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
                <Button 
                  variant="outline" 
                  className="w-full font-medium"
                  onClick={() => handleDownload(cert.title)}
                >
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-2xl border-indigo-200 bg-indigo-50/50 shadow-sm mt-8">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="bg-white p-4 rounded-full shadow-sm border border-indigo-100">
            <GraduationCap className="h-10 w-10 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Looking for your Degree?</h3>
            <p className="text-sm text-slate-600">Your official degree will appear here once you have completed all graduation requirements and your final graduation application has been approved by the registrar.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

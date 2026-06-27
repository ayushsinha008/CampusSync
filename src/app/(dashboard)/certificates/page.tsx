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

const typeStyles = {
  academic: {
    bar: 'bg-indigo-500',
    icon: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400',
  },
  honor: {
    bar: 'bg-amber-500',
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  professional: {
    bar: 'bg-emerald-500',
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
};

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
        <h1 className="text-2xl font-bold text-heading tracking-tight">Certificates & Awards</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your academic honors and certifications stored in the database.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => {
          const Icon = icons[cert.type] || Award;
          const style = typeStyles[cert.type] || typeStyles.academic;
          return (
            <Card
              key={cert._id}
              className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              <div className={`h-2 ${style.bar}`} />
              <CardHeader className="pb-2">
                <div className={`p-3 rounded-xl w-fit mb-2 ${style.icon}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-tight">{cert.title}</CardTitle>
                <CardDescription className="font-medium text-muted-foreground">{cert.issuer}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Awarded on:{' '}
                  <span className="font-semibold text-foreground">
                    {format(new Date(cert.awardedDate), 'dd MMM yyyy')}
                  </span>
                </p>
              </CardContent>
              <div className="p-4 border-t border-border bg-muted/40 mt-auto">
                <Button variant="outline" className="w-full font-medium" onClick={() => toast.success(`Downloading: ${cert.title}`)}>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-2xl border-border bg-brand-muted/40 shadow-sm">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="bg-card p-4 rounded-full shadow-sm border border-border">
            <GraduationCap className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Degree Certificate</h3>
            <p className="text-sm text-muted-foreground">
              Your official degree certificate will appear here after graduation requirements are completed and approved by the registrar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

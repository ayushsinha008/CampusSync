'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Bell, Pin, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';

type Notice = {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  pinned?: boolean;
};

export default function NoticesPage() {
  const { data: session } = useSession();
  const isStaff = (session?.user as { role?: string })?.role === 'staff';

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notices');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load notices');
      }
      setNotices(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load notices');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to publish notice');
      }
      toast.success('Notice published');
      setIsNoticeOpen(false);
      setTitle('');
      setDescription('');
      setCategory('General');
      fetchNotices();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to publish notice');
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto min-h-full pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-heading">Notice Board</h1>
          <p className="text-muted-foreground mt-1">Important updates and announcements from campus administration.</p>
        </div>

        {isStaff && (
          <Dialog open={isNoticeOpen} onOpenChange={setIsNoticeOpen}>
            <DialogTrigger render={<Button className="w-full sm:w-auto shrink-0 bg-foreground text-background hover:bg-foreground/90" />}>
              <Plus className="mr-2 h-4 w-4" /> Add Notice
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publish New Notice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddNotice} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Exam, Event, Academic"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                </div>
                <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90">
                  Publish
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </>
        ) : notices.length === 0 ? (
          <div className="text-center p-12 border rounded-xl border-dashed border-border bg-muted">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No notices yet</h3>
            <p className="text-muted-foreground mt-1 max-w-md mx-auto">
              {isStaff
                ? 'Publish the first notice using the Add Notice button above.'
                : 'Check back later for updates from the administration.'}
            </p>
          </div>
        ) : (
          notices.map((notice) => (
            <Card
              key={notice._id}
              className={`rounded-2xl shadow-sm border-border bg-card ${
                notice.pinned ? 'border-brand/30 bg-brand-muted/20' : ''
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {notice.pinned && <Pin className="h-4 w-4 text-brand fill-brand" />}
                      <CardTitle className="text-xl">{notice.title}</CardTitle>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(new Date(notice.date), 'MMM d, yyyy')}
                      </span>
                      <Badge variant="secondary" className="text-[10px] h-4">
                        {notice.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {notice.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

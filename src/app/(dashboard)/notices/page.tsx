'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Bell, Pin, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function NoticesPage() {
  const { data: session } = useSession();
  const isStaff = (session?.user as any)?.role === 'staff';

  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Notice State
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/notices');
      const data = await res.json();
      setNotices(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load notices');
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
        body: JSON.stringify({ title, description, category })
      });
      if (res.ok) {
        toast.success('Notice published');
        setIsNoticeOpen(false);
        setTitle(''); setDescription(''); setCategory('General');
        fetchNotices();
      }
    } catch {
      toast.error('Failed to publish notice');
    }
  };

  if (loading) return <div>Loading notice board...</div>;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto min-h-full pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Notice Board</h1>
          <p className="text-muted-foreground mt-1">Important updates and announcements.</p>
        </div>

        {isStaff && (
          <Dialog open={isNoticeOpen} onOpenChange={setIsNoticeOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" /> Add Notice
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publish New Notice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddNotice} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input required value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input required value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Exam, Event, General" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} />
                </div>
                <Button type="submit" className="w-full">Publish</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="text-center p-12 border rounded-xl border-dashed bg-slate-50 dark:bg-slate-900/50">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No new notices</h3>
            <p className="text-muted-foreground mt-1">Check back later for updates from the administration.</p>
          </div>
        ) : (
          notices.map((notice) => (
            <Card key={notice._id} className={`rounded-2xl shadow-sm ${notice.pinned ? 'border-primary/50 bg-primary/5 dark:bg-primary/10 border' : 'border-none'}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {notice.pinned && <Pin className="h-4 w-4 text-primary fill-primary" />}
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
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{notice.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

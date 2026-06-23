'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BookOpen, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Uncategorized');
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category })
      });
      if (res.ok) {
        toast.success('Note added');
        setIsOpen(false);
        setTitle(''); setContent(''); setCategory('Uncategorized');
        fetchNotes();
      }
    } catch {
      toast.error('Failed to add note');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Note deleted');
        fetchNotes();
      }
    } catch {
      toast.error('Failed to delete note');
    }
  };

  if (loading) return <div>Loading notes...</div>;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto min-h-full pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Personal Notes</h1>
          <p className="text-muted-foreground mt-1">Organize your thoughts and study materials.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> New Note
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create a New Note</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Data Structures Exam Tips" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Study, Personal, Project" />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea 
                  required 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder="Write your note here..."
                  className="min-h-[150px]"
                />
              </div>
              <Button type="submit" className="w-full">Save Note</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.length === 0 ? (
          <div className="col-span-full text-center p-12 border rounded-xl border-dashed bg-slate-50 dark:bg-slate-900/50">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No notes yet</h3>
            <p className="text-muted-foreground mt-1">Click the button above to create your first personal note.</p>
          </div>
        ) : (
          notes.map((note) => (
            <Card key={note._id} className="flex flex-col h-full hover:shadow-md transition-shadow group rounded-2xl border-none shadow-sm bg-white dark:bg-slate-950">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive shrink-0"
                    onClick={() => handleDelete(note._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs font-normal">{note.category}</Badge>
                  <span className="flex items-center text-xs text-muted-foreground gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-foreground/80 whitespace-pre-wrap line-clamp-6">
                  {note.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

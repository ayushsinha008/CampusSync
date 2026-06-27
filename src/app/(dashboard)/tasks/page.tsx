'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format, isPast } from 'date-fns';
import { Upload, Download, Plus, Trash2, FileText, Clock, BookOpen } from 'lucide-react';
import { AssignmentSectionCharts } from '@/components/admin/SectionChartBlocks';

interface AssignmentItem {
  _id: string;
  subject: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  attachmentUrl?: string;
  attachmentFileName?: string;
  submitted?: boolean;
  submission?: {
    fileUrl: string;
    fileName: string;
    submittedAt: string;
  } | null;
  submissions?: Array<{
    _id: string;
    fileUrl: string;
    fileName: string;
    submittedAt: string;
    studentId?: { name?: string; email?: string };
  }>;
  submissionCount?: number;
}

export default function AssignmentsPage() {
  const { data: session } = useSession();
  const isStaff = (session?.user as { role?: string })?.role === 'staff';

  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [teacherFile, setTeacherFile] = useState<File | null>(null);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/assignments');
      if (res.ok) {
        const data = await res.json();
        setAssignments(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('description', description);
    formData.append('dueDate', dueDate);
    formData.append('priority', priority);
    if (teacherFile) formData.append('file', teacherFile);

    try {
      const res = await fetch('/api/assignments', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        toast.success('Assignment published for students');
        setIsOpen(false);
        setTitle('');
        setSubject('');
        setDescription('');
        setDueDate('');
        setPriority('Medium');
        setTeacherFile(null);
        fetchAssignments();
      } else {
        toast.error(data.message || 'Failed to create assignment');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const handleStudentUpload = async (assignmentId: string, file: File) => {
    setUploadingId(assignmentId);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        toast.success('Assignment submitted successfully');
        fetchAssignments();
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Assignment removed');
        fetchAssignments();
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const priorityColor = (p: string) => {
    if (p === 'High') return 'bg-red-50 text-red-600';
    if (p === 'Medium') return 'bg-amber-50 text-amber-600';
    return 'bg-emerald-50 text-emerald-600';
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto min-h-full pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Assignments</h1>
          <p className="text-muted-foreground mt-1">
            {isStaff
              ? 'Publish assignments and review student submissions.'
              : 'View teacher assignments and upload your completed work.'}
          </p>
        </div>

        {isStaff && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={<Button className="bg-[#1C1A3A] hover:bg-[#2D2B52]" />}>
              <Plus className="mr-2 h-4 w-4" /> Post Assignment
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Post New Assignment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Web Development" required />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" required />
                </div>
                <div className="space-y-2">
                  <Label>Instructions</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What students need to do..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(v) => v && setPriority(v as typeof priority)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Assignment File (optional)</Label>
                  <Input type="file" accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.txt" onChange={(e) => setTeacherFile(e.target.files?.[0] || null)} />
                  <p className="text-[11px] text-slate-400">Upload the question paper or brief for students (max 10MB)</p>
                </div>
                <Button type="submit" className="w-full">Publish Assignment</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="font-semibold text-slate-800">No assignments yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {isStaff
                ? 'Post an assignment for your students using the button above.'
                : 'Your teacher has not posted any assignments yet. Check back later.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assignments.map((assignment) => {
            const overdue = isPast(new Date(assignment.dueDate));
            return (
              <Card key={assignment._id} className="rounded-2xl border border-slate-100 shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-4 w-4 text-[#5B4FCF] shrink-0" />
                        <span className="text-xs font-semibold text-[#5B4FCF] truncate">{assignment.subject}</span>
                      </div>
                      <CardTitle className="text-lg leading-snug">{assignment.title}</CardTitle>
                    </div>
                    {isStaff && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(assignment._id)}>
                        <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className={priorityColor(assignment.priority)}>{assignment.priority}</Badge>
                    {assignment.submitted && !isStaff && (
                      <Badge className="bg-emerald-50 text-emerald-600">Submitted</Badge>
                    )}
                    {overdue && !assignment.submitted && !isStaff && (
                      <Badge className="bg-red-50 text-red-600">Overdue</Badge>
                    )}
                    {isStaff && (
                      <Badge variant="secondary">{assignment.submissionCount ?? 0} submissions</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assignment.description && (
                    <p className="text-sm text-muted-foreground">{assignment.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                  </div>

                  {assignment.attachmentUrl && (
                    <a
                      href={assignment.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[#5B4FCF] hover:underline"
                    >
                      <Download className="h-4 w-4" />
                      Download: {assignment.attachmentFileName || 'Assignment file'}
                    </a>
                  )}

                  {!isStaff && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      {assignment.submission ? (
                        <div className="rounded-lg bg-emerald-50 p-3 text-sm">
                          <p className="font-medium text-emerald-700">Your submission</p>
                          <a href={assignment.submission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1 mt-1">
                            <FileText className="h-3.5 w-3.5" /> {assignment.submission.fileName}
                          </a>
                          <p className="text-[11px] text-emerald-600/70 mt-1">
                            Submitted {format(new Date(assignment.submission.submittedAt), 'MMM dd, yyyy h:mm a')}
                          </p>
                        </div>
                      ) : null}

                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.txt"
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[assignment._id] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleStudentUpload(assignment._id, file);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        className="w-full"
                        variant={assignment.submission ? 'outline' : 'default'}
                        disabled={uploadingId === assignment._id}
                        onClick={() => fileInputRefs.current[assignment._id]?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploadingId === assignment._id
                          ? 'Uploading...'
                          : assignment.submission
                            ? 'Replace Submission'
                            : 'Upload Assignment'}
                      </Button>
                      <p className="text-[10px] text-center text-slate-400">PDF, DOC, DOCX, ZIP, PNG, JPG, TXT — max 10MB</p>
                    </div>
                  )}

                  {isStaff && assignment.submissions && assignment.submissions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <p className="text-xs font-semibold text-slate-600">Student Submissions</p>
                      {assignment.submissions.map((sub) => (
                        <div key={sub._id} className="flex items-center justify-between gap-2 text-xs bg-slate-50 rounded-lg p-2">
                          <span className="truncate font-medium">{sub.studentId?.name || 'Student'}</span>
                          <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[#5B4FCF] hover:underline shrink-0 flex items-center gap-1">
                            <Download className="h-3 w-3" /> File
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {isStaff && (
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#1E293B]">Submission Analytics</h2>
            <p className="text-sm text-slate-500 mt-0.5">Charts based on assignment submission data</p>
          </div>
          <AssignmentSectionCharts />
        </div>
      )}
    </div>
  );
}

'use client';

import { useSession } from 'next-auth/react';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, User, Trash2, Plus } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetablePage() {
  const { data: session } = useSession();
  const isStaff = (session?.user as any)?.role === 'staff';
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Subject State
  const [subjectName, setSubjectName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [room, setRoom] = useState('');
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);

  // New Timetable State
  const [selectedSubject, setSelectedSubject] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isTimetableOpen, setIsTimetableOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [subjRes, timeRes] = await Promise.all([
        fetch('/api/subjects'),
        fetch('/api/timetable')
      ]);
      const subjData = await subjRes.json();
      const timeData = await timeRes.json();
      
      setSubjects(Array.isArray(subjData) ? subjData : []);
      setTimetables(Array.isArray(timeData) ? timeData : []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: subjectName, faculty, room })
      });
      if (res.ok) {
        toast.success('Subject added');
        setIsSubjectOpen(false);
        setSubjectName(''); setFaculty(''); setRoom('');
        fetchData();
      }
    } catch {
      toast.error('Failed to add subject');
    }
  };

  const handleAddTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: selectedSubject, day, startTime, endTime })
      });
      if (res.ok) {
        toast.success('Class scheduled');
        setIsTimetableOpen(false);
        setSelectedSubject(''); setDay(''); setStartTime(''); setEndTime('');
        fetchData();
      }
    } catch {
      toast.error('Failed to schedule class');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/timetable/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Class removed');
        fetchData();
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div>Loading timetable...</div>;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto min-h-full pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Timetable</h1>
        
        {isStaff && (
        <div className="flex gap-2">
          <Dialog open={isSubjectOpen} onOpenChange={setIsSubjectOpen}>
            <DialogTrigger render={<Button variant="outline" />}>
              <Plus className="mr-2 h-4 w-4" /> Add Subject
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject Name</Label>
                  <Input required value={subjectName} onChange={e => setSubjectName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Faculty (Optional)</Label>
                  <Input value={faculty} onChange={e => setFaculty(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Default Room (Optional)</Label>
                  <Input value={room} onChange={e => setRoom(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Save Subject</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isTimetableOpen} onOpenChange={setIsTimetableOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" /> Add Class
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule a Class</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTimetable} className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v || '')} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select value={day} onValueChange={(v) => setDay(v || '')} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={subjects.length === 0}>
                  {subjects.length === 0 ? 'Add a subject first' : 'Schedule Class'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DAYS.map(dayName => {
          const dayClasses = timetables.filter(t => t.day === dayName);
          if (dayClasses.length === 0) return null;

          return (
            <Card key={dayName} className="border-t-4 border-t-indigo-500 rounded-2xl shadow-sm border-x-0 border-b-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  {dayName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {dayClasses.map((cls) => (
                  <div key={cls._id} className="p-3 rounded-xl border border-slate-100 bg-white dark:bg-slate-950 shadow-sm flex justify-between items-start group">
                    <div className="space-y-1">
                      <p className="font-semibold">{cls.subjectId?.name || 'Unknown Subject'}</p>
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Clock className="h-3 w-3" />
                        {cls.startTime} - {cls.endTime}
                      </div>
                      {(cls.subjectId?.room || cls.subjectId?.faculty) && (
                        <div className="flex items-center text-xs text-muted-foreground gap-3 mt-1">
                          {cls.subjectId?.room && (
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> {cls.subjectId.room}</span>
                          )}
                          {cls.subjectId?.faculty && (
                            <span className="flex items-center gap-1"><User className="h-3 w-3"/> {cls.subjectId.faculty}</span>
                          )}
                        </div>
                      )}
                    </div>
                    {isStaff && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive"
                      onClick={() => handleDelete(cls._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {timetables.length === 0 && (
        <div className="text-center p-12 border rounded-xl border-dashed bg-slate-50 dark:bg-slate-900/50">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No classes scheduled</h3>
          <p className="text-muted-foreground mt-1">Add subjects and schedule your classes to see your timetable here.</p>
        </div>
      )}
    </div>
  );
}

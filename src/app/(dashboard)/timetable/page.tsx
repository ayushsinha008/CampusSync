'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Calendar, Clock, MapPin, User, Trash2, Plus, ArrowLeft,
  GraduationCap, Scale, Briefcase, BookOpen, ChevronRight, Building2,
} from 'lucide-react';
import type { AcademicDepartment } from '@/lib/academic-catalog';
import { resolveStudentProgram } from '@/lib/academic-catalog';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEPT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  engineering: GraduationCap,
  law: Scale,
  management: Briefcase,
  arts: BookOpen,
};

type TimetableSlot = {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  department: string;
  program: string;
  subjectId?: { _id: string; name: string; faculty?: string; room?: string };
};

type Subject = { _id: string; name: string };

type Step = 'department' | 'program' | 'timetable';

function Panel({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </div>
  );
}

function scrollMainToTop() {
  document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function TimetablePage() {
  const { data: session, status: sessionStatus } = useSession();
  const isStaff = (session?.user as { role?: string })?.role === 'staff';
  const [studentBranch, setStudentBranch] = useState<string | undefined>();

  const [catalog, setCatalog] = useState<AcademicDepartment[]>([]);
  const [step, setStep] = useState<Step>('department');
  const [selectedDept, setSelectedDept] = useState<AcademicDepartment | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<{ id: string; name: string; label: string } | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetables, setTimetables] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [timetableLoading, setTimetableLoading] = useState(false);

  const [subjectName, setSubjectName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [room, setRoom] = useState('');
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isTimetableOpen, setIsTimetableOpen] = useState(false);

  const fetchCatalog = useCallback(async () => {
    const res = await fetch('/api/timetable/catalog');
    const data = await res.json();
    if (Array.isArray(data)) setCatalog(data);
  }, []);

  const fetchSubjects = useCallback(async () => {
    const res = await fetch('/api/subjects');
    const data = await res.json();
    setSubjects(Array.isArray(data) ? data : []);
  }, []);

  const fetchTimetable = useCallback(async (department: string, program: string) => {
    setTimetableLoading(true);
    try {
      const res = await fetch(`/api/timetable?department=${department}&program=${program}`);
      const data = await res.json();
      setTimetables(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load timetable');
    } finally {
      setTimetableLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchCatalog(), fetchSubjects()]).finally(() => setLoading(false));
  }, [fetchCatalog, fetchSubjects]);

  useEffect(() => {
    if (sessionStatus === 'loading' || isStaff) return;
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.branch) setStudentBranch(data.branch);
      })
      .catch(() => {});
  }, [sessionStatus, isStaff]);

  useEffect(() => {
    if (loading || catalog.length === 0 || isStaff) return;
    const mapped = resolveStudentProgram(studentBranch);
    if (!mapped) return;
    const dept = catalog.find((d) => d.id === mapped.department);
    const prog = dept?.programs.find((p) => p.id === mapped.program);
    if (dept && prog) {
      setSelectedDept(dept);
      setSelectedProgram(prog);
      setStep('timetable');
      fetchTimetable(mapped.department, mapped.program);
    }
  }, [loading, catalog, studentBranch, isStaff, fetchTimetable]);

  useEffect(() => {
    if (step === 'timetable' && selectedDept && selectedProgram) {
      fetchTimetable(selectedDept.id, selectedProgram.id);
    }
  }, [step, selectedDept, selectedProgram, fetchTimetable]);

  const handleSelectDepartment = (dept: AcademicDepartment) => {
    setSelectedDept(dept);
    setSelectedProgram(null);
    setStep('program');
    scrollMainToTop();
  };

  const handleSelectProgram = (prog: { id: string; name: string; label: string }) => {
    setSelectedProgram(prog);
    setStep('timetable');
    scrollMainToTop();
  };

  const handleBack = () => {
    if (step === 'timetable') {
      setStep('program');
      setSelectedProgram(null);
    } else if (step === 'program') {
      setStep('department');
      setSelectedDept(null);
    }
    scrollMainToTop();
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: subjectName, faculty, room }),
      });
      if (res.ok) {
        toast.success('Subject added');
        setIsSubjectOpen(false);
        setSubjectName('');
        setFaculty('');
        setRoom('');
        fetchSubjects();
      }
    } catch {
      toast.error('Failed to add subject');
    }
  };

  const handleAddTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !selectedProgram) return;
    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject,
          day,
          startTime,
          endTime,
          department: selectedDept.id,
          program: selectedProgram.id,
        }),
      });
      if (res.ok) {
        toast.success('Class scheduled');
        setIsTimetableOpen(false);
        setSelectedSubject('');
        setDay('');
        setStartTime('');
        setEndTime('');
        fetchTimetable(selectedDept.id, selectedProgram.id);
      }
    } catch {
      toast.error('Failed to schedule class');
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedDept || !selectedProgram) return;
    try {
      const res = await fetch(`/api/timetable/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Class removed');
        fetchTimetable(selectedDept.id, selectedProgram.id);
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Class Schedule</h1>
          <p className="mt-1 text-sm text-slate-500">
            {step === 'department' && 'Select a department to view class timetables'}
            {step === 'program' && selectedDept && `Choose a program under ${selectedDept.name}`}
            {step === 'timetable' && selectedDept && selectedProgram && (
              <span className="inline-flex items-center gap-1 flex-wrap">
                <Building2 className="h-3.5 w-3.5" />
                {selectedDept.name} · {selectedProgram.name} · Weekly Timetable
              </span>
            )}
          </p>
        </div>

        {isStaff && step === 'timetable' && (
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Dialog open={isSubjectOpen} onOpenChange={setIsSubjectOpen}>
              <DialogTrigger render={<Button variant="outline" className="rounded-xl flex-1 sm:flex-none min-w-[140px]" />}>
                <Plus className="mr-2 h-4 w-4" /> Add Subject
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Subject</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSubject} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject Name</Label>
                    <Input required value={subjectName} onChange={(e) => setSubjectName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Faculty (Optional)</Label>
                    <Input value={faculty} onChange={(e) => setFaculty(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Room (Optional)</Label>
                    <Input value={room} onChange={(e) => setRoom(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full">Save Subject</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isTimetableOpen} onOpenChange={setIsTimetableOpen}>
              <DialogTrigger render={<Button className="rounded-xl bg-brand hover:bg-brand/90 flex-1 sm:flex-none min-w-[140px]" />}>
                <Plus className="mr-2 h-4 w-4" /> Add Class
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Schedule Class — {selectedProgram?.name}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTimetable} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v || '')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Day of Week</Label>
                    <Select value={day} onValueChange={(v) => setDay(v || '')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} />
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

      {step !== 'department' && (
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center text-sm font-bold text-[#5B4FCF] hover:bg-[#EEEAFD] rounded-xl px-3 py-2 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 'program' ? 'Back to departments' : 'Back to programs'}
        </button>
      )}

      {step === 'department' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {catalog.map((dept) => {
            const Icon = DEPT_ICONS[dept.id] || GraduationCap;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => handleSelectDepartment(dept)}
                className="text-left group"
              >
                <Panel className="p-5 h-full hover:border-[#5B4FCF]/30 hover:shadow-md active:bg-[#EEEAFD]/40 transition-all cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEEAFD] text-[#5B4FCF]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#5B4FCF] transition-colors" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[#1E293B]">{dept.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-[#5B4FCF]">{dept.shortName}</p>
                  <p className="mt-2 text-sm text-slate-500">{dept.description}</p>
                  <p className="mt-3 text-[11px] text-slate-400">{dept.programs.length} programs</p>
                </Panel>
              </button>
            );
          })}
        </div>
      )}

      {step === 'program' && selectedDept && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedDept.programs.map((prog) => (
            <button
              key={prog.id}
              type="button"
              onClick={() => handleSelectProgram(prog)}
              className="text-left group"
            >
              <Panel className="p-5 hover:border-[#5B4FCF]/30 hover:shadow-md active:bg-[#EEEAFD]/40 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-[#5B4FCF]">{prog.name}</p>
                    <p className="mt-1 text-sm font-semibold text-[#1E293B]">{prog.label}</p>
                    <p className="mt-2 text-xs text-slate-400">{selectedDept.name}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#5B4FCF] shrink-0" />
                </div>
              </Panel>
            </button>
          ))}
        </div>
      )}

      {step === 'timetable' && selectedDept && selectedProgram && (
        <>
          {timetableLoading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : timetables.length === 0 ? (
            <Panel className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-[#1E293B]">No classes scheduled</h3>
              <p className="text-sm text-slate-500 mt-1">
                No timetable found for {selectedProgram.name} under {selectedDept.name}.
              </p>
            </Panel>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DAYS.map((dayName) => {
                const dayClasses = timetables.filter((t) => t.day === dayName);
                if (dayClasses.length === 0) return null;

                return (
                  <Panel key={dayName} className="overflow-hidden border-t-4 border-t-[#5B4FCF]">
                    <div className="px-5 pt-4 pb-2">
                      <h3 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[#5B4FCF]" />
                        {dayName}
                      </h3>
                    </div>
                    <div className="px-5 pb-5 space-y-3">
                      {dayClasses.map((cls) => (
                        <div
                          key={cls._id}
                          className="p-3 rounded-xl border border-slate-100 bg-[#FAFBFC] flex justify-between items-start group"
                        >
                          <div className="space-y-1 min-w-0">
                            <p className="font-semibold text-[#1E293B]">{cls.subjectId?.name || 'Unknown Subject'}</p>
                            <div className="flex items-center text-xs text-slate-500 gap-1">
                              <Clock className="h-3 w-3 shrink-0" />
                              {cls.startTime} - {cls.endTime}
                            </div>
                            {(cls.subjectId?.room || cls.subjectId?.faculty) && (
                              <div className="flex flex-wrap items-center text-xs text-slate-500 gap-3 mt-1">
                                {cls.subjectId?.room && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {cls.subjectId.room}
                                  </span>
                                )}
                                {cls.subjectId?.faculty && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" /> {cls.subjectId.faculty}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          {isStaff && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 h-8 w-8 text-red-500 shrink-0"
                              onClick={() => handleDelete(cls._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </Panel>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

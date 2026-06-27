'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type CalEvent = {
  _id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('Campus');

  const loadEvents = () => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    fetch(`/api/calendar?month=${month}&year=${year}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setEvents(data);
      })
      .catch(() => toast.error('Failed to load calendar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    loadEvents();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = new Date();

  const getEventsForDay = (day: number) =>
    events.filter((e) => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date: eventDate, time, location, type: 'event' }),
    });
    if (res.ok) {
      toast.success('Event added');
      setOpen(false);
      setTitle('');
      setEventDate('');
      setTime('');
      loadEvents();
    } else {
      toast.error('Failed to add event');
    }
  };

  if (loading && events.length === 0) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-heading tracking-tight">Academic Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Classes, exams, assignments and campus events.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shrink-0" />}>
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Calendar Event</DialogTitle></DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Date</Label><Input type="date" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>Time</Label><Input required placeholder="10:00 AM" value={time} onChange={(e) => setTime(e.target.value)} /></div>
              <div className="space-y-2"><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
              <Button type="submit" className="w-full">Save Event</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 rounded-2xl border-border shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4 bg-muted border-b border-border">
            <CardTitle className="text-base sm:text-lg font-bold text-foreground">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex gap-2 self-end sm:self-auto">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Mobile: day-by-day agenda */}
            <div className="md:hidden divide-y divide-border">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday =
                  day === today.getDate() &&
                  currentDate.getMonth() === today.getMonth() &&
                  currentDate.getFullYear() === today.getFullYear();
                const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                return (
                  <div key={day} className={`px-4 py-3 ${isToday ? 'bg-blue-500/10' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-foreground'}`}>
                        {dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      {isToday && <Badge className="text-[10px] h-5">Today</Badge>}
                    </div>
                    {dayEvents.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No events</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {dayEvents.map((event) => (
                          <li key={event._id} className="text-xs rounded-lg bg-brand-muted/50 text-brand px-2 py-1.5">
                            <span className="font-semibold">{event.time}</span> — {event.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Tablet+: scrollable month grid */}
            <div className="hidden md:block overflow-x-auto">
              <div className="min-w-[560px]">
            <div className="grid grid-cols-7 border-b border-border bg-muted/60">
              {DAYS.map((day) => (
                <div key={day} className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 bg-card">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border bg-muted/30" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday =
                  day === today.getDate() &&
                  currentDate.getMonth() === today.getMonth() &&
                  currentDate.getFullYear() === today.getFullYear();
                return (
                  <div key={day} className={`min-h-[80px] lg:min-h-[100px] p-1.5 sm:p-2 border-b border-r border-border ${isToday ? 'bg-blue-500/10' : ''}`}>
                    <div className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-blue-600 text-white' : 'text-foreground'}`}>{day}</div>
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div key={event._id} className="text-[10px] font-medium px-1 py-0.5 rounded bg-brand-muted text-brand truncate">{event.time} - {event.title}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 rounded-2xl border-border shadow-sm h-fit">
          <CardHeader className="py-4 border-b border-border">
            <CardTitle className="text-lg font-bold text-foreground">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {events.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No events this month.</p>
            ) : (
              events.map((event) => (
                <div key={event._id} className="p-4 hover:bg-muted/50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">{event.title}</h4>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center"><Clock className="h-3.5 w-3.5 mr-2" />{new Date(event.date).toLocaleDateString('en-IN')} · {event.time}</div>
                    <div className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-2" />{event.location}</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

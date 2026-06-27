'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MOCK_EVENTS = [
  { id: 1, title: 'CS101 Midterm', date: 15, type: 'exam', time: '10:00 AM', location: 'Hall A' },
  { id: 2, title: 'CS Society Meetup', date: 15, type: 'club', time: '4:00 PM', location: 'Student Center' },
  { id: 3, title: 'Project Deadline', date: 18, type: 'assignment', time: '11:59 PM', location: 'Online' },
  { id: 4, title: 'Guest Lecture', date: 22, type: 'event', time: '2:00 PM', location: 'Auditorium' },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getEventsForDay = (day: number) => MOCK_EVENTS.filter(e => e.date === day);

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Academic Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your classes, exams, and events.</p>
        </div>
        <Button className="bg-[#1C64F2] hover:bg-blue-700 text-white">
          <CalendarIcon className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="col-span-1 lg:col-span-2 rounded-2xl border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
              {DAYS.map(day => (
                <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-100 last:border-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 bg-white">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/30" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday = day === 15; // Hardcoded today for mock
                
                return (
                  <div key={day} className={`min-h-[100px] p-2 border-b border-r border-slate-100 last:border-r-0 transition-colors hover:bg-slate-50 cursor-pointer ${isToday ? 'bg-blue-50/30' : ''}`}>
                    <div className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-[#1C64F2] text-white' : 'text-slate-700'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map(event => (
                        <div key={event.id} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 truncate" title={event.title}>
                          {event.time} - {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events List */}
        <Card className="col-span-1 rounded-2xl border-slate-200 shadow-sm h-fit">
          <CardHeader className="py-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {MOCK_EVENTS.map(event => (
              <div key={event.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-800">{event.title}</h4>
                  <Badge variant="outline" className={`
                    ${event.type === 'exam' ? 'border-red-200 text-red-700 bg-red-50' : ''}
                    ${event.type === 'club' ? 'border-indigo-200 text-indigo-700 bg-indigo-50' : ''}
                    ${event.type === 'assignment' ? 'border-amber-200 text-amber-700 bg-amber-50' : ''}
                  `}>
                    {event.type}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1.5 text-sm text-slate-500">
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-2" />
                    {currentDate.toLocaleString('default', { month: 'short' })} {event.date}, {event.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-2" />
                    {event.location}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

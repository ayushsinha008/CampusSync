'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ClipboardList, CheckSquare, Bell, Tag, BarChart2, BookOpen, ExternalLink, MoreHorizontal, User, MapPin, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, Variants } from 'framer-motion';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { id: '0',  label: '1st Semester', yourGPA: 2.5, avgGPA: 2.25 },
  { id: '1',  label: '1st Semester', yourGPA: 2.5, avgGPA: 2.25 },
  { id: '2',  label: '1st Semester', yourGPA: 2.3, avgGPA: 2.72 },
  { id: '3',  label: '1st Semester', yourGPA: 2.3, avgGPA: 2.72 },
  { id: '4',  label: '2nd Semester', yourGPA: 2.7, avgGPA: 2.15 },
  { id: '5',  label: '2nd Semester', yourGPA: 2.7, avgGPA: 2.15 },
  { id: '6',  label: '2nd Semester', yourGPA: 2.33, avgGPA: 2.5 },
  { id: '7',  label: '2nd Semester', yourGPA: 2.33, avgGPA: 2.5 },
  { id: '8',  label: '3rd Semester', yourGPA: 1.9, avgGPA: 2.25 },
  { id: '9',  label: '3rd Semester', yourGPA: 1.9, avgGPA: 2.25 },
  { id: '10', label: '4th Semester', yourGPA: 2.5, avgGPA: 2.45 },
  { id: '11', label: '4th Semester', yourGPA: 2.5, avgGPA: 2.45 },
  { id: '12', label: '4th Semester', yourGPA: 2.85, avgGPA: 2.75 },
  { id: '13', label: '4th Semester', yourGPA: 2.85, avgGPA: 2.75 },
  { id: '14', label: '5th Semester', yourGPA: 3.2, avgGPA: 2.55 },
  { id: '15', label: '5th Semester', yourGPA: 3.2, avgGPA: 2.55 },
  { id: '16', label: '5th Semester', yourGPA: 3.2, avgGPA: 2.9 },
  { id: '17', label: '5th Semester', yourGPA: 3.2, avgGPA: 2.9 },
  { id: '18', label: '6th Semester', yourGPA: 3.5, avgGPA: 3.35 },
  { id: '19', label: '6th Semester', yourGPA: 3.5, avgGPA: 3.35 },
  { id: '20', label: '6th Semester', yourGPA: 3.85, avgGPA: 3.35 },
  { id: '21', label: '6th Semester', yourGPA: 3.85, avgGPA: 3.35 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#FFFDF8] p-4 border border-amber-100/60 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-w-[170px]">
        <p className="text-[12px] font-bold text-slate-800 mb-3">{data.label} 2025</p>
        <div className="flex flex-col gap-2.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-500 font-medium">{entry.name === 'yourGPA' ? 'Your GPA' : 'Average GPA'}</span>
              </div>
              <span className="font-extrabold text-slate-900">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/dashboard')
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        })
        .catch(err => setLoading(false));
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-4 max-w-[1400px] mx-auto min-h-full pb-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-[140px] w-full rounded-2xl" />
          <Skeleton className="h-[140px] w-full rounded-2xl" />
          <Skeleton className="h-[140px] w-full rounded-2xl" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <Skeleton className="h-[200px] w-full rounded-2xl" />
      </div>
    );
  }

  const role = (session?.user as any)?.role || 'student';

  if (role === 'staff') {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex-1 space-y-6 max-w-[1400px] mx-auto min-h-full pb-8">
        <motion.div variants={itemVariants} className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Staff Dashboard</h2>
        </motion.div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={itemVariants}><Card className="rounded-2xl border-none shadow-sm"><CardHeader className="flex flex-row items-center justify-between pb-2"><div className="flex items-center gap-2 text-slate-600 font-medium text-sm"><CheckSquare className="h-4 w-4 text-blue-500" />Tasks Due</div></CardHeader><CardContent><div className="text-3xl font-bold text-slate-800 dark:text-white">{data?.stats?.tasksDue || 0}</div></CardContent></Card></motion.div>
          <motion.div variants={itemVariants}><Card className="rounded-2xl border-none shadow-sm"><CardHeader className="flex flex-row items-center justify-between pb-2"><div className="flex items-center gap-2 text-slate-600 font-medium text-sm"><ClipboardList className="h-4 w-4 text-green-500" />Attendance</div></CardHeader><CardContent><div className="text-3xl font-bold text-slate-800 dark:text-white">{data?.stats?.attendancePercentage || 0}%</div></CardContent></Card></motion.div>
          <motion.div variants={itemVariants}><Card className="rounded-2xl border-none shadow-sm"><CardHeader className="flex flex-row items-center justify-between pb-2"><div className="flex items-center gap-2 text-slate-600 font-medium text-sm"><Bell className="h-4 w-4 text-purple-500" />New Notices</div></CardHeader><CardContent><div className="text-3xl font-bold text-slate-800 dark:text-white">{data?.stats?.newNoticesCount || 0}</div></CardContent></Card></motion.div>
          <motion.div variants={itemVariants}><Card className="rounded-2xl border-none shadow-sm"><CardHeader className="flex flex-row items-center justify-between pb-2"><div className="flex items-center gap-2 text-slate-600 font-medium text-sm"><Calendar className="h-4 w-4 text-orange-500" />Upcoming Classes</div></CardHeader><CardContent><div className="text-3xl font-bold text-slate-800 dark:text-white">{data?.stats?.upcomingClasses || 0}</div></CardContent></Card></motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl border-none shadow-sm mt-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">Recent Admin Activity</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Manage global system content</p>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-500 py-8 text-center border border-dashed rounded-xl">
                You have global access. Use the sidebar to manage students, notices, and timetables.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  const hasClasses = data?.todaySchedule && data.todaySchedule.length > 0;

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="flex-1 space-y-6 max-w-[1400px] mx-auto min-h-full pb-8"
    >
      
      {/* TOP ROW METRICS */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-[13px]">
                <Tag className="h-4 w-4 text-indigo-900 fill-indigo-900" />
                Credits Completed
              </div>
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[40px] font-extrabold text-slate-800 tracking-tight">120</span>
                <span className="text-lg text-slate-400 font-medium">/144</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-medium">
                <span className="text-slate-400">Compared To Last Semester</span>
                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">+24 Credits</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-[13px]">
                <BarChart2 className="h-4 w-4 text-indigo-900 fill-indigo-900" />
                Grade Point Average
              </div>
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[40px] font-extrabold text-slate-800 tracking-tight">3.75</span>
                <span className="text-lg text-slate-400 font-medium">/4.00</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-medium">
                <span className="text-slate-400">Compared To Last Semester</span>
                <span className="bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">-0.25 Points</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-[13px]">
                <BookOpen className="h-4 w-4 text-indigo-900 fill-indigo-900" />
                Active Class
              </div>
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[40px] font-extrabold text-slate-800 tracking-tight">15</span>
                <span className="text-lg text-slate-400 font-medium">/18</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-medium">
                <span className="text-slate-400">Active Course This Semester</span>
                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">+3 Active Course</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* MAIN CONTENT ROW */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* LEFT COLUMN: Chart + Table (Takes up 2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white h-full">
              <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
                <div>
                  <CardTitle className="text-[15px] font-bold text-slate-800">Grade Point Average</CardTitle>
                  <p className="text-[11px] text-slate-400 mt-0.5">Comparison between your GPA and Average Student GPA</p>
                </div>
                <select className="text-[11px] border-slate-200 rounded-lg bg-slate-50 py-1 px-2.5 text-slate-700 font-medium outline-none cursor-pointer">
                  <option>All Semesters</option>
                </select>
              </CardHeader>
              <CardContent className="p-5 pt-2 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorYourGpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.15}/>
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f1f5f9" strokeOpacity={1} />
                    <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} tickFormatter={(val) => {
                      const map: any = { '1': '1st Semester', '5': '2nd Semester', '9': '3rd Semester', '13': '4th Semester', '17': '5th Semester', '21': '6th Semester' };
                      return map[val] || '';
                    }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} domain={[1.0, 4.0]} ticks={[1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#fbcfe8', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Line type="linear" dataKey="avgGPA" stroke="#e11d48" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 5, fill: '#e11d48', strokeWidth: 0 }} />
                    <Area type="linear" dataKey="yourGPA" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorYourGpa)" activeDot={{ r: 6, strokeWidth: 3, fill: '#8b5cf6', stroke: 'white' }} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between p-5 pb-3">
                <div>
                  <CardTitle className="text-[15px] font-semibold text-slate-800">Payment & Tuition History</CardTitle>
                  <p className="text-[11px] text-slate-400 mt-0.5">Complete data about your payment and tuition history</p>
                </div>
                <button className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1 hover:bg-slate-50">
                  View All Payment
                </button>
              </CardHeader>
              <CardContent className="p-5 pt-0 pb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] text-left whitespace-nowrap">
                    <thead className="text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="pb-2 font-medium px-4">Payment ID</th>
                        <th className="pb-2 font-medium px-4">Payment Category</th>
                        <th className="pb-2 font-medium px-4">Date</th>
                        <th className="pb-2 font-medium px-4">Payment Status</th>
                        <th className="pb-3 font-medium px-4 text-center">...</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-4 text-slate-500 font-medium">PID - 331829</td>
                        <td className="py-2.5 px-4 text-slate-800 font-semibold">6th Semester Tuition</td>
                        <td className="py-2.5 px-4 text-slate-500">23 October 2024</td>
                        <td className="py-2.5 px-4">
                          <span className="bg-amber-100/60 text-amber-600 px-3 py-1 rounded-md font-medium text-xs">On-Verification</span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <ExternalLink className="h-3.5 w-3.5 text-slate-400 inline-block cursor-pointer hover:text-slate-600" />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-500 font-medium">PID - 331828</td>
                        <td className="py-2.5 px-4 text-slate-800 font-semibold">Internship Program 2025</td>
                        <td className="py-2.5 px-4 text-slate-500">24 August 2024</td>
                        <td className="py-2.5 px-4">
                          <span className="bg-emerald-100/60 text-emerald-600 px-3 py-1 rounded-md font-medium text-xs">Completed</span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <ExternalLink className="h-3.5 w-3.5 text-slate-400 inline-block cursor-pointer hover:text-slate-600" />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-500 font-medium">PID - 331827</td>
                        <td className="py-2.5 px-4 text-slate-800 font-semibold">5th Semester Tuition</td>
                        <td className="py-2.5 px-4 text-slate-500">20 May 2024</td>
                        <td className="py-2.5 px-4">
                          <span className="bg-emerald-100/60 text-emerald-600 px-3 py-1 rounded-md font-medium text-xs">Completed</span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <ExternalLink className="h-3.5 w-3.5 text-slate-400 inline-block cursor-pointer hover:text-slate-600" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Daily Class Schedule (Takes up 1/3) */}
        <div className="lg:col-span-1">
          <motion.div variants={itemVariants} className="h-full">
            <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
                <div>
                  <CardTitle className="text-[15px] font-semibold text-slate-800">Daily Class Schedule</CardTitle>
                  <p className="text-[11px] text-slate-400 mt-0.5">Schedule for your class in weekly & daily</p>
                </div>
                <select className="text-[11px] border-slate-200 rounded-lg bg-slate-50 py-1 px-2.5 text-slate-600 outline-none cursor-pointer">
                  <option>Daily</option>
                </select>
              </CardHeader>
              <CardContent className="p-5 pt-2 flex-1 flex flex-col gap-2.5">
                {hasClasses ? (
                  data.todaySchedule.map((cls: any, i: number) => (
                    <div key={i} className="border border-slate-100 rounded-xl p-3 flex flex-col gap-3 relative hover:border-slate-200 transition-colors bg-white">
                      <ExternalLink className="absolute top-3 right-3 h-3.5 w-3.5 text-slate-300" />
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-indigo-700 text-sm">
                          {cls.subjectId?.name?.substring(0,2).toUpperCase() || 'SB'}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800">{cls.subjectId?.name}</h4>
                          <p className="text-[11px] text-slate-400">{cls.startTime} - {cls.endTime}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-400"><User className="h-3 w-3" /> Lecturer</div>
                        <div className="text-right text-slate-700 font-medium truncate">{cls.subjectId?.faculty || 'TBD'}</div>
                        <div className="flex items-center gap-1.5 text-slate-400"><MapPin className="h-3 w-3" /> Course Room</div>
                        <div className="text-right text-slate-700 font-medium">{cls.subjectId?.room || 'TBD'}</div>
                        <div className="flex items-center gap-1.5 text-slate-400"><BookOpen className="h-3 w-3" /> Course Credits</div>
                        <div className="text-right text-slate-700 font-medium">4 Credits</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="border border-slate-100 rounded-xl p-2.5 flex flex-col gap-2.5 relative hover:border-slate-200 transition-colors bg-white">
                      <ExternalLink className="absolute top-3 right-3 h-3.5 w-3.5 text-slate-300" />
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden">
                          <img src="https://i.pravatar.cc/150?u=b" alt="Lecturer" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-[13px] font-semibold text-slate-800">Logics & Algebra</h4>
                          <p className="text-[11px] text-slate-400">08.30 AM - 09.30 AM</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-400"><User className="h-3 w-3" /> Lecturer</div>
                        <div className="text-right text-slate-700 font-medium truncate">Endang Setyowati, Ph.D</div>
                        <div className="flex items-center gap-1.5 text-slate-400"><MapPin className="h-3 w-3" /> Course Room</div>
                        <div className="text-right text-slate-700 font-medium">HCI - 401</div>
                        <div className="flex items-center gap-1.5 text-slate-400"><BookOpen className="h-3 w-3" /> Course Credits</div>
                        <div className="text-right text-slate-700 font-medium">4 Credits</div>
                      </div>
                    </div>
                    
                    <div className="border border-slate-100 rounded-xl p-2.5 flex flex-col gap-2.5 relative hover:border-slate-200 transition-colors bg-white">
                      <ExternalLink className="absolute top-3 right-3 h-3.5 w-3.5 text-slate-300" />
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden">
                          <img src="https://i.pravatar.cc/150?u=c" alt="Lecturer" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-[13px] font-semibold text-slate-800">Risk Management System</h4>
                          <p className="text-[11px] text-slate-400">09.30 AM - 01.30 PM</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-400"><User className="h-3 w-3" /> Lecturer</div>
                        <div className="text-right text-slate-700 font-medium truncate">Dadang Nurjaman, Ph.D</div>
                        <div className="flex items-center gap-1.5 text-slate-400"><MapPin className="h-3 w-3" /> Course Room</div>
                        <div className="text-right text-slate-700 font-medium">HCI - 303</div>
                        <div className="flex items-center gap-1.5 text-slate-400"><BookOpen className="h-3 w-3" /> Course Credits</div>
                        <div className="text-right text-slate-700 font-medium">4 Credits</div>
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-xl p-2.5 flex flex-col gap-2.5 relative hover:border-slate-200 transition-colors bg-white">
                      <ExternalLink className="absolute top-3 right-3 h-3.5 w-3.5 text-slate-300" />
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden">
                          <img src="https://i.pravatar.cc/150?u=d" alt="Lecturer" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-[13px] font-semibold text-slate-800">Networking & Engineering</h4>
                          <p className="text-[11px] text-slate-400">01.30 PM - 03.30 PM</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-400"><User className="h-3 w-3" /> Lecturer</div>
                        <div className="text-right text-slate-700 font-medium truncate">Jusuf Pariaman, Ph.D</div>
                        <div className="flex items-center gap-1.5 text-slate-400"><MapPin className="h-3 w-3" /> Course Room</div>
                        <div className="text-right text-slate-700 font-medium">HCI - 401</div>
                        <div className="flex items-center gap-1.5 text-slate-400"><BookOpen className="h-3 w-3" /> Course Credits</div>
                        <div className="text-right text-slate-700 font-medium">4 Credits</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

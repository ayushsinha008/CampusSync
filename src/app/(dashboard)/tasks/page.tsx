'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trash2, Plus } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline?: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, deadline, priority }),
      });
      
      if (res.ok) {
        const newTask = await res.json();
        setTasks([newTask, ...tasks]);
        setIsOpen(false);
        setTitle('');
        setDescription('');
        setDeadline('');
        setPriority('Medium');
        toast.success('Task created successfully');
      } else {
        toast.error('Failed to create task');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const toggleTaskStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      
      if (res.ok) {
        setTasks(tasks.map(t => t._id === id ? { ...t, completed: !currentStatus } : t));
        toast.success('Task updated');
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setTasks(tasks.filter(t => t._id !== id));
        toast.success('Task deleted');
      }
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (p: string) => {
    if (p === 'High') return 'text-red-500';
    if (p === 'Medium') return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto min-h-full pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Tasks</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Create Task</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks found. Create one!</p>
        ) : (
          tasks.map((task) => (
            <Card key={task._id} className={`rounded-2xl border-none shadow-sm ${task.completed ? 'opacity-60 bg-slate-50 dark:bg-slate-900' : 'bg-white dark:bg-slate-950'}`}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={task.completed} 
                    onCheckedChange={() => toggleTaskStatus(task._id, task.completed)} 
                  />
                  <CardTitle className={`text-lg ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteTask(task._id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                </Button>
              </CardHeader>
              <CardContent>
                {task.description && <p className="text-sm text-muted-foreground mb-2">{task.description}</p>}
                <div className="flex justify-between items-center text-xs mt-4">
                  <span className={`font-semibold ${getPriorityColor(task.priority)}`}>{task.priority} Priority</span>
                  {task.deadline && (
                    <span className="text-muted-foreground">
                      Due: {format(new Date(task.deadline), 'MMM dd, yyyy')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

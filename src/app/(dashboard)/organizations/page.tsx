'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, ShieldCheck, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_ORGS = [
  {
    id: 1,
    name: 'Computer Science Society',
    category: 'Academic',
    members: 1240,
    description: 'The official society for CS majors. We host hackathons, workshops, and tech talks.',
    joined: true,
    initials: 'CS',
  },
  {
    id: 2,
    name: 'Debate Club',
    category: 'Extracurricular',
    members: 150,
    description: 'Improve your public speaking and critical thinking skills. Weekly sparring sessions.',
    joined: false,
    initials: 'DC',
  },
  {
    id: 3,
    name: 'Campus Finance Association',
    category: 'Professional',
    members: 320,
    description: 'Learn about investing, personal finance, and corporate accounting from industry leaders.',
    joined: true,
    initials: 'CFA',
  },
  {
    id: 4,
    name: 'Photography Club',
    category: 'Arts',
    members: 85,
    description: 'For everyone who loves taking pictures. DSLR and smartphone photographers welcome!',
    joined: false,
    initials: 'PC',
  },
  {
    id: 5,
    name: 'Robotics Team',
    category: 'Engineering',
    members: 210,
    description: 'Build robots and compete in national university tournaments.',
    joined: false,
    initials: 'RT',
  },
  {
    id: 6,
    name: 'Student Government',
    category: 'Leadership',
    members: 45,
    description: 'Representing the student body and managing campus-wide initiatives.',
    joined: true,
    initials: 'SGA',
  }
];

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState(MOCK_ORGS);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleJoin = (id: number) => {
    setOrgs(orgs.map(org => {
      if (org.id === id) {
        const isJoining = !org.joined;
        toast.success(isJoining ? `Joined ${org.name}!` : `Left ${org.name}`);
        return { ...org, joined: isJoining };
      }
      return org;
    }));
  };

  const filteredOrgs = orgs.filter(org => org.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const myOrgs = filteredOrgs.filter(org => org.joined);
  const discoverOrgs = filteredOrgs.filter(org => !org.joined);

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Organizations</h1>
          <p className="text-sm text-slate-500 mt-1">Discover and join campus clubs and societies.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search organizations..." 
              className="pl-9 w-[250px] bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="bg-[#1C1A3A] text-white">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Org
          </Button>
        </div>
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-orgs">My Organizations</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discoverOrgs.length > 0 ? discoverOrgs.map(org => (
              <OrgCard key={org.id} org={org} onToggle={() => handleToggleJoin(org.id)} />
            )) : (
              <div className="col-span-full py-12 text-center text-slate-500">No organizations found.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-orgs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myOrgs.length > 0 ? myOrgs.map(org => (
              <OrgCard key={org.id} org={org} onToggle={() => handleToggleJoin(org.id)} />
            )) : (
              <div className="col-span-full py-12 text-center text-slate-500">You haven't joined any organizations yet.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrgCard({ org, onToggle }: { org: any, onToggle: () => void }) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col transition-all hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-4">
          <Avatar className="h-12 w-12 border-2 border-slate-100">
            <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold">{org.initials}</AvatarFallback>
          </Avatar>
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium">{org.category}</Badge>
        </div>
        <CardTitle className="text-lg text-slate-800 leading-tight">{org.name}</CardTitle>
        <div className="flex items-center text-sm text-slate-500 mt-2">
          <Users className="h-4 w-4 mr-1.5" />
          {org.members.toLocaleString()} members
        </div>
      </CardHeader>
      <CardContent className="flex-1 text-sm text-slate-600">
        {org.description}
      </CardContent>
      <CardFooter className="pt-4 border-t border-slate-100">
        <Button 
          variant={org.joined ? "outline" : "default"}
          className={`w-full font-semibold ${!org.joined ? 'bg-[#1C64F2] hover:bg-blue-700 text-white' : ''}`}
          onClick={onToggle}
        >
          {org.joined ? (
            <><ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" /> Joined</>
          ) : (
            'Join Organization'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

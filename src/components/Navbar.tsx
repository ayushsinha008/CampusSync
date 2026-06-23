'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, LogOut, Search, MessageSquare, Bell, MonitorPlay } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

export function Navbar() {
  const { setTheme, theme } = useTheme();
  const { data: session } = useSession();

  return (
    <header className="flex h-[72px] items-center justify-between gap-4 bg-white border-b border-slate-100 px-8">
      <Button variant="outline" size="icon" className="shrink-0 md:hidden border-slate-200">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>
      
      <div className="hidden md:flex items-center">
        <h2 className="text-[19px] font-semibold text-slate-800">
          Welcome Back, {session?.user?.name || 'Student'}
        </h2>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative hidden lg:flex items-center w-64">
          <Search className="absolute left-3 h-[18px] w-[18px] text-slate-400" />
          <Input
            type="search"
            placeholder="Search Here"
            className="w-full bg-[#fafafb] border-none pl-10 h-10 rounded-xl text-[13px] font-medium text-slate-600 focus-visible:ring-1 focus-visible:ring-slate-300 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1 border border-slate-100 rounded-xl p-1 bg-white">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 h-8 w-8">
            <MonitorPlay className="h-[18px] w-[18px]" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 relative h-8 w-8">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-red-500 border border-white"></span>
          </Button>

          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-lg ml-1" />}>
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs rounded-lg">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize mt-1 border border-primary/20 bg-primary/10 text-primary px-2 py-0.5 rounded-full w-fit">
                        {(session.user as any)?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

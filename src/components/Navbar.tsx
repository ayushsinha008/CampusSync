'use client';

import { Button } from '@/components/ui/button';
import { Menu, LogOut, Search, MessageSquare, Bell } from 'lucide-react';
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

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <header className="flex h-[72px] shrink-0 items-center gap-4 border-b border-slate-100 bg-white px-4 sm:px-6 lg:px-8">
      <Button
        variant="outline"
        size="icon"
        className="shrink-0 lg:hidden border-slate-200 h-9 w-9"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>

      <h2 className="min-w-0 flex-1 truncate text-[17px] font-semibold text-[#1E293B] sm:text-[19px] lg:max-w-none">
        Welcome Back, {session?.user?.name || 'Student'}
      </h2>

      <div className="relative hidden md:block w-52 lg:w-64 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400 pointer-events-none" />
        <Input
          type="search"
          placeholder="Search Here"
          className="w-full bg-[#F5F6FA] border-0 pl-10 h-10 rounded-xl text-[13px] font-medium text-slate-600 shadow-none focus-visible:ring-1 focus-visible:ring-slate-200 placeholder:text-slate-400"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1 border border-slate-100 rounded-xl p-1 bg-white">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 h-8 w-8"
        >
          <MessageSquare className="h-[18px] w-[18px]" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 relative h-8 w-8"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-red-500 border border-white" />
        </Button>

        {session && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" className="relative h-8 w-8 rounded-full ml-0.5 p-0" />}
            >
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage
                  src={session.user?.image || 'https://i.pravatar.cc/150?u=rohmad'}
                  alt={session.user?.name || ''}
                />
                <AvatarFallback className="bg-[#EEEAFD] text-[#5B4FCF] text-xs rounded-full">
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
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

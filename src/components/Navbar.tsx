'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, Search, MessageSquare, Bell, LogOut, User, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavbarProps {
  onMenuClick?: () => void;
}

type AppNotification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
};

type SearchResult = {
  type: string;
  title: string;
  subtitle: string;
  href: string;
};

type InboxMessage = {
  id: string;
  title: string;
  body: string;
  href: string;
  kind: 'personal' | 'campus';
};

const flyoutClass =
  'absolute right-0 top-[calc(100%+8px)] z-50 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border border-border bg-popover p-1 shadow-lg';

export function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>();

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => setAvatarSrc(data.image || undefined))
      .catch(() => undefined);
  }, [session?.user?.id]);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  const [messagesOpen, setMessagesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<InboxMessage[]>([]);

  const firstName = session?.user?.name?.split(' ')[0] || 'Student';

  const closePanels = () => {
    setSearchOpen(false);
    setMessagesOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !searchRef.current?.contains(target) &&
        !mobileSearchRef.current?.contains(target) &&
        !messagesRef.current?.contains(target) &&
        !notificationsRef.current?.contains(target) &&
        !profileRef.current?.contains(target)
      ) {
        closePanels();
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const loadNotifications = () => {
    fetch('/api/notifications')
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});
  };

  const loadMessages = () => {
    fetch('/api/messages')
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (session) {
      loadNotifications();
      loadMessages();
    }
  }, [session]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results || []);
        setSearchOpen(true);
        setMessagesOpen(false);
        setNotificationsOpen(false);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const markAllRead = () => {
    fetch('/api/notifications', { method: 'PATCH' }).then(() => loadNotifications());
  };

  const goToResult = (href: string) => {
    closePanels();
    setMobileSearchOpen(false);
    setQuery('');
    router.push(href);
  };

  const toggleMessages = () => {
    const next = !messagesOpen;
    setMessagesOpen(next);
    setNotificationsOpen(false);
    setSearchOpen(false);
    setMobileSearchOpen(false);
    if (next) loadMessages();
  };

  const toggleNotifications = () => {
    const next = !notificationsOpen;
    setNotificationsOpen(next);
    setMessagesOpen(false);
    setSearchOpen(false);
    setMobileSearchOpen(false);
    if (next) {
      loadNotifications();
      if (unreadCount > 0) markAllRead();
    }
  };

  const toggleProfile = () => {
    const next = !profileOpen;
    setProfileOpen(next);
    setMessagesOpen(false);
    setNotificationsOpen(false);
    setSearchOpen(false);
    setMobileSearchOpen(false);
  };

  const goTo = (href: string) => {
    closePanels();
    setMobileSearchOpen(false);
    router.push(href);
  };

  const searchResults = searchOpen && (
    <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 rounded-2xl border border-border bg-popover shadow-lg overflow-hidden">
      {searching ? (
        <p className="px-4 py-3 text-sm text-muted-foreground">Searching...</p>
      ) : results.length === 0 ? (
        <p className="px-4 py-3 text-sm text-muted-foreground">No results for &quot;{query}&quot;</p>
      ) : (
        <ul className="max-h-72 overflow-y-auto py-1">
          {results.map((item, i) => (
            <li key={`${item.href}-${i}`}>
              <button
                type="button"
                onClick={() => goToResult(item.href)}
                className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors"
              >
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <header className="relative z-30 shrink-0 border-b border-border bg-card">
      <div className="flex h-14 sm:h-[72px] items-center gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 lg:hidden border-border h-9 w-9"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>

        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-heading sm:text-base md:hidden">
          Hi, {firstName}
        </p>

        <h2 className="hidden md:block min-w-0 flex-1 truncate text-[16px] font-semibold text-heading lg:text-[18px] lg:max-w-[220px] xl:max-w-none">
          Welcome Back, {firstName}
        </h2>

        <div ref={searchRef} className="relative hidden md:block flex-1 min-w-0 max-w-md lg:max-w-lg md:ml-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground pointer-events-none z-10" />
          <Input
            type="search"
            placeholder="Search Here"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2) {
                setSearchOpen(true);
                setMessagesOpen(false);
                setNotificationsOpen(false);
              }
            }}
            className="w-full h-11 rounded-full border-0 bg-page pl-11 pr-4 text-[13px] font-medium text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-brand/20"
          />
          {searchResults}
        </div>

        <div className="flex shrink-0 items-center gap-0.5 rounded-2xl border border-border bg-card p-1 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'md:hidden text-muted-foreground hover:text-brand hover:bg-brand-muted/60 rounded-xl h-9 w-9',
              mobileSearchOpen && 'bg-brand-muted/60 text-brand'
            )}
            aria-label="Search"
            onClick={() => {
              setMobileSearchOpen((v) => !v);
              closePanels();
            }}
          >
            {mobileSearchOpen ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" />}
          </Button>

          <ThemeToggle />

          <div ref={messagesRef} className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'text-muted-foreground hover:text-brand hover:bg-brand-muted/60 rounded-xl h-9 w-9',
                messagesOpen && 'bg-brand-muted/60 text-brand'
              )}
              aria-label="Messages"
              aria-expanded={messagesOpen}
              onClick={toggleMessages}
            >
              <MessageSquare className="h-[18px] w-[18px]" />
            </Button>

            {messagesOpen && (
              <div className={flyoutClass}>
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Messages</p>
                <div className="my-1 h-px bg-border" />
                {messages.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-muted-foreground">No messages yet</p>
                ) : (
                  <ul className="max-h-72 overflow-y-auto">
                    {messages.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => goTo(m.href)}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
                        >
                          <p className="text-sm font-semibold text-foreground">{m.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{m.body}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  onClick={() => goTo('/notices')}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-brand hover:bg-muted rounded-xl"
                >
                  Open Notice Board
                </button>
              </div>
            )}
          </div>

          <div ref={notificationsRef} className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'text-muted-foreground hover:text-brand hover:bg-brand-muted/60 rounded-xl h-9 w-9 relative',
                notificationsOpen && 'bg-brand-muted/60 text-brand'
              )}
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              onClick={toggleNotifications}
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-card" />
              )}
            </Button>

            {notificationsOpen && (
              <div className={flyoutClass}>
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notifications</p>
                <div className="my-1 h-px bg-border" />
                {notifications.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-muted-foreground">No notifications yet</p>
                ) : (
                  <ul className="max-h-72 overflow-y-auto">
                    {notifications.slice(0, 6).map((n) => (
                      <li key={n._id}>
                        <div className="px-3 py-2.5">
                          <p className="text-sm font-semibold text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  onClick={() => goTo('/notices')}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-brand hover:bg-muted rounded-xl"
                >
                  View campus notices
                </button>
              </div>
            )}
          </div>

          {session && (
            <div ref={profileRef} className="relative ml-0.5">
              <button
                type="button"
                onClick={toggleProfile}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition',
                  'hover:ring-2 hover:ring-brand/25',
                  profileOpen && 'ring-2 ring-brand/25'
                )}
                aria-label="Account menu"
                aria-expanded={profileOpen}
              >
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={avatarSrc || undefined} alt={session.user?.name || ''} />
                  <AvatarFallback className="bg-brand-muted text-brand text-xs font-bold rounded-full">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>

              {profileOpen && (
                <div className={cn(flyoutClass, 'w-52')}>
                  <p className="px-3 py-2 text-xs font-semibold text-muted-foreground truncate">{session.user?.email}</p>
                  <div className="my-1 h-px bg-border" />
                  <button
                    type="button"
                    onClick={() => goTo('/profile')}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <User className="h-4 w-4 text-brand" />
                    My Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {mobileSearchOpen && (
        <div ref={mobileSearchRef} className="relative border-t border-border px-4 py-3 md:hidden">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            type="search"
            placeholder="Search students, pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2) setSearchOpen(true);
            }}
            autoFocus
            className="w-full h-10 rounded-full border border-border bg-page pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground"
          />
          {searchResults}
        </div>
      )}
    </header>
  );
}

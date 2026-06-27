export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground [&_input]:text-foreground [&_input]:caret-foreground [&_input::placeholder]:text-muted-foreground">
      {children}
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CampusSyncLogoProps {
  href?: string | null;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  textClassName?: string;
}

const sizes = {
  sm: { icon: 28, text: 'text-[15px]' },
  md: { icon: 32, text: 'text-[19px]' },
  lg: { icon: 40, text: 'text-[24px]' },
};

export function CampusSyncLogo({
  href = '/dashboard',
  showText = true,
  size = 'md',
  className,
  textClassName,
}: CampusSyncLogoProps) {
  const { icon, text } = sizes[size];

  const content = (
    <>
      <Image
        src="/campussync-logo.svg"
        alt="CampusSync"
        width={icon}
        height={icon}
        className="shrink-0"
        priority
      />
      {showText && (
        <span className={cn('font-extrabold text-heading tracking-tight', text, textClassName)}>
          CampusSync
        </span>
      )}
    </>
  );

  const wrapperClass = cn('flex items-center gap-2.5', className);

  if (href != null && href !== '') {
    return (
      <Link href={href} className={wrapperClass}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}

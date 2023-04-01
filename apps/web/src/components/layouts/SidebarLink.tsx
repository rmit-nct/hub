import { Tooltip } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppearance } from '../../hooks/useAppearance';

interface SidebarLinkProps {
  href?: string;
  onClick?: () => void;
  label?: string;
  activeIcon?: React.ReactNode;
  inactiveIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  showIcon?: boolean;
  showLabel?: boolean;
  showTooltip?: boolean;
  enableOffset?: boolean;
  defaultActive?: boolean;
  defaultHighlight?: boolean;
  left?: boolean;
  className?: string;
  exactMatch?: boolean;
}

export default function SidebarLink({
  href,
  onClick,
  label,
  activeIcon,
  inactiveIcon,
  trailingIcon,
  showIcon = true,
  showLabel = true,
  showTooltip = false,
  defaultActive = true,
  defaultHighlight = true,
  left = false,
  className,
  exactMatch = false,
}: SidebarLinkProps) {
  const router = useRouter();
  const { wsId, teamId } = router.query;

  const { sidebar, setSidebar } = useAppearance();

  const isExpanded = sidebar === 'open';

  const enhancedPath = router.pathname
    .replace('/[teamId]', `/${teamId}`)
    .replace('/[wsId]', `/${wsId}`);

  const isActive = href
    ? exactMatch
      ? enhancedPath === href
      : enhancedPath.startsWith(href)
    : false;

  return (
    <Link
      href={href || '#'}
      onClick={() => {
        if (onClick) onClick();
        if (window && window.innerWidth <= 768) setSidebar('closed');
      }}
      className="font-semibold"
    >
      <Tooltip
        label={label}
        position="right"
        offset={16}
        disabled={!showTooltip}
      >
        <div
          className={`flex items-center gap-2 rounded ${
            defaultHighlight
              ? defaultActive && isActive
                ? 'bg-zinc-300/10 p-2 text-zinc-100'
                : 'p-2 text-zinc-300 md:hover:bg-zinc-300/5 md:hover:text-zinc-100'
              : ''
          } ${
            left || isExpanded ? 'justify-start' : 'justify-center'
          } ${className}`}
        >
          {showIcon && (
            <div className="flex-none">
              {isActive
                ? activeIcon ?? inactiveIcon
                : inactiveIcon ?? activeIcon}
            </div>
          )}
          {showLabel && !showTooltip && (
            <>
              <div className="line-clamp-1 inline-block w-full text-sm">
                {label}
              </div>
              {trailingIcon}
            </>
          )}
        </div>
      </Tooltip>
    </Link>
  );
}
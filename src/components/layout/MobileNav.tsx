import { NavLink } from 'react-router-dom';
import { Inbox, Calendar, FolderOpen, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MobileNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function MobileNavItem({ to, icon, label }: MobileNavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          // Minimum 44px touch target height enforced via min-h
          'flex flex-col items-center justify-center gap-1 flex-1 min-h-[44px] px-1 text-xs font-medium transition-colors',
          isActive
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        )
      }
      aria-label={label}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

/**
 * Fixed bottom navigation bar for mobile viewports (<768px).
 * Hidden on desktop via md:hidden.
 */
export function MobileNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 safe-area-pb"
      aria-label="Mobile navigation"
    >
      <MobileNavItem to="/inbox" icon={<Inbox size={20} />} label="Inbox" />
      <MobileNavItem to="/today" icon={<Calendar size={20} />} label="Today" />
      <MobileNavItem
        to="/projects"
        icon={<FolderOpen size={20} />}
        label="Projects"
      />
      <MobileNavItem
        to="/settings"
        icon={<Settings size={20} />}
        label="Settings"
      />
    </nav>
  );
}

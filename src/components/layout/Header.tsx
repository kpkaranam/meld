import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import { SyncIndicator } from '@/components/shared/SyncIndicator';
import { useUIStore } from '@/stores/uiStore';

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { openMobileSidebar } = useUIStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  async function handleSignOut() {
    await authService.signOut();
    navigate('/login', { replace: true });
  }

  // Derive initials for avatar placeholder
  const initials = user?.email ? user.email.charAt(0).toUpperCase() : '?';

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header role="banner" className="flex items-center h-14 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 gap-4">
        {/* Left: hamburger (mobile only) */}
        <button
          type="button"
          onClick={openMobileSidebar}
          className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        {/* Spacer — pushes right-side controls to the right on desktop */}
        <div className="flex-1" aria-hidden="true" />

        {/* Center: search trigger */}
        <SearchBar onOpen={() => setIsSearchOpen(true)} />

        {/* Right: sync indicator + theme toggle + avatar + sign out */}
        <div className="flex items-center gap-2">
          {/* Sync / connection status */}
          <SyncIndicator />

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Avatar */}
          <div
            className="h-7 w-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold select-none"
            aria-label={user?.email ?? 'User avatar'}
            title={user?.email ?? undefined}
          >
            {initials}
          </div>

          {/* Sign out */}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} aria-hidden="true" />
            <span className="sr-only">Sign out</span>
          </button>
        </div>
      </header>

      {/* Global search overlay controlled by Ctrl+K */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { Sidebar } from './Sidebar';
import { cn } from '@/utils/cn';

/**
 * Mobile-only slide-over overlay that wraps the Sidebar.
 * Triggered by the hamburger button in the Header.
 *
 * - Only rendered/interactive on mobile (<768px); on desktop it is hidden.
 * - Animates in from the left with a semi-transparent backdrop.
 * - Closes when the backdrop is clicked or the Escape key is pressed.
 */
export function MobileSidebarOverlay() {
  const { mobileSidebarOpen, closeMobileSidebar } = useUIStore();

  // Close on Escape key
  useEffect(() => {
    if (!mobileSidebarOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMobileSidebar();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileSidebarOpen, closeMobileSidebar]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  return (
    <>
      {/* Backdrop — hidden on desktop */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-200',
          mobileSidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
        aria-hidden="true"
        onClick={closeMobileSidebar}
      />

      {/* Slide-over panel — hidden on desktop */}
      <div
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 w-72 shadow-xl',
          'transition-transform duration-200 ease-in-out',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/*
          Render Sidebar with forceShow=true so it displays as a flex container
          even though we are on mobile (where it would otherwise be hidden md:flex).
        */}
        <Sidebar forceShow />
      </div>
    </>
  );
}

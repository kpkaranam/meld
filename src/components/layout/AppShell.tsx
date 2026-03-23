import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { MobileNav } from './MobileNav';
import { MobileSidebarOverlay } from './MobileSidebarOverlay';
import { useThemeSync } from '../../hooks/useThemeSync';

/**
 * Top-level authenticated layout:
 *   - Desktop (>=768px): collapsible sidebar on the left + scrollable main content
 *   - Mobile (<768px): full-width main content + fixed bottom MobileNav
 *                      + hamburger-triggered sidebar slide-over overlay
 *
 * The Sidebar itself is hidden on mobile via CSS (hidden md:flex).
 * MobileNav is hidden on desktop via CSS (md:hidden).
 * MobileSidebarOverlay is only rendered on mobile when the hamburger is tapped.
 */
export function AppShell() {
  useThemeSync();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Skip to main content link — visible on focus for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar slide-over overlay */}
      <MobileSidebarOverlay />

      {/* Main content (header + page outlet) */}
      <MainContent />

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}

// Re-export Outlet for the route tree — AppShell itself wraps a nested <Route>
// so React Router will render child routes into the Outlet inside MainContent.
export { Outlet };

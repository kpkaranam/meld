import { Outlet } from 'react-router-dom';
import { Header } from './Header';

/**
 * Scrollable main content area with a fixed Header at the top.
 * Renders nested route content via <Outlet />.
 *
 * The inner wrapper uses h-full so that pages that rely on flex h-full
 * layouts (InboxPage, TodayPage, ProjectView) fill the available space
 * correctly without being constrained by a max-width container.
 *
 * Pages that benefit from a max-width constraint (Settings, etc.) should
 * apply their own max-width inside their component.
 */
export function MainContent() {
  return (
    <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto" id="main-content" tabIndex={-1}>
        {/* h-full lets child pages that use flex/h-full fill the main area.
            pb-16 (mobile) / pb-0 (desktop) accounts for MobileNav height. */}
        <div className="h-full pb-16 md:pb-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

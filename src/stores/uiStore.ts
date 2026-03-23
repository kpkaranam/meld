import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type MobileNavTab = 'inbox' | 'today' | 'projects' | 'settings';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  /** Whether the mobile slide-over sidebar overlay is visible */
  mobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;

  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;

  mobileNavTab: MobileNavTab;
  setMobileNavTab: (tab: MobileNavTab) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      mobileSidebarOpen: false,
      openMobileSidebar: () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),

      activeModal: null,
      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null }),

      mobileNavTab: 'inbox',
      setMobileNavTab: (tab) => set({ mobileNavTab: tab }),
    }),
    {
      name: 'meld-ui',
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
    }
  )
);

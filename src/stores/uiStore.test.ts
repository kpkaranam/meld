import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './uiStore';

beforeEach(() => {
  // Reset store to default values before each test
  useUIStore.setState({
    sidebarOpen: true,
    activeModal: null,
    mobileNavTab: 'inbox',
  });
});

describe('uiStore — initial state', () => {
  it('has sidebarOpen set to true by default', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('has no active modal by default', () => {
    expect(useUIStore.getState().activeModal).toBeNull();
  });

  it('has "inbox" as the default mobileNavTab', () => {
    expect(useUIStore.getState().mobileNavTab).toBe('inbox');
  });
});

describe('uiStore — sidebar', () => {
  it('toggleSidebar flips sidebarOpen from true to false', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });

  it('toggleSidebar flips sidebarOpen from false to true', () => {
    useUIStore.setState({ sidebarOpen: false });
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('setSidebarOpen(false) sets sidebarOpen to false', () => {
    useUIStore.getState().setSidebarOpen(false);
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });

  it('setSidebarOpen(true) sets sidebarOpen to true', () => {
    useUIStore.setState({ sidebarOpen: false });
    useUIStore.getState().setSidebarOpen(true);
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });
});

describe('uiStore — modals', () => {
  it('openModal sets activeModal to the given id', () => {
    useUIStore.getState().openModal('confirm-delete');
    expect(useUIStore.getState().activeModal).toBe('confirm-delete');
  });

  it('closeModal sets activeModal back to null', () => {
    useUIStore.setState({ activeModal: 'some-modal' });
    useUIStore.getState().closeModal();
    expect(useUIStore.getState().activeModal).toBeNull();
  });
});

describe('uiStore — mobileNavTab', () => {
  it('setMobileNavTab updates the active tab', () => {
    useUIStore.getState().setMobileNavTab('today');
    expect(useUIStore.getState().mobileNavTab).toBe('today');
  });

  it('setMobileNavTab can switch between all valid tabs', () => {
    const tabs = ['inbox', 'today', 'projects', 'settings'] as const;
    for (const tab of tabs) {
      useUIStore.getState().setMobileNavTab(tab);
      expect(useUIStore.getState().mobileNavTab).toBe(tab);
    }
  });
});

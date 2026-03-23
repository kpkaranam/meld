import { useEffect } from 'react';
import { APP_NAME } from '../utils/constants';

/**
 * Sets the document title for the current page.
 * Resets to APP_NAME when the component unmounts.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = APP_NAME;
    };
  }, [title]);
}

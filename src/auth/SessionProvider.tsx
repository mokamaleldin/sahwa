import { useEffect, type ReactNode } from 'react';
import { sessionClient, SESSION_CHANGE_KEY, type SessionClient } from '../lib/sessionClient';
import { SessionContext } from './SessionContext';

export default function SessionProvider({ children, client = sessionClient }: { children: ReactNode; client?: SessionClient }) {
  useEffect(() => {
    void client.refresh();
    const visible = () => { if (document.visibilityState === 'visible') void client.refresh(); };
    const storage = (event: StorageEvent) => { if (event.key === SESSION_CHANGE_KEY) void client.refresh({ force: true }); };
    const expired = () => client.anonymous();
    window.addEventListener('focus', visible);
    window.addEventListener('pageshow', visible);
    window.addEventListener('storage', storage);
    window.addEventListener('sahwa:unauthorized', expired);
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.removeEventListener('focus', visible); window.removeEventListener('pageshow', visible);
      window.removeEventListener('storage', storage); window.removeEventListener('sahwa:unauthorized', expired);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [client]);
  return <SessionContext.Provider value={client}>{children}</SessionContext.Provider>;
}

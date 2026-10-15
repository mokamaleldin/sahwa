import { useContext, useSyncExternalStore } from 'react';
import { SessionContext } from './SessionContext';

export function useSession() {
  const client = useContext(SessionContext);
  const snapshot = useSyncExternalStore(client.subscribe, client.getSnapshot, client.getServerSnapshot);
  return { ...snapshot, refresh: client.refresh, signIn: client.signIn, signOut: client.signOut };
}

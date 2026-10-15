import { createContext } from 'react';
import { sessionClient, type SessionClient } from '../lib/sessionClient';
export const SessionContext = createContext<SessionClient>(sessionClient);

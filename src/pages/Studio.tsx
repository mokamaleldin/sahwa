import { Helmet } from 'react-helmet-async';
import RequireSession from '../auth/RequireSession';

export default function Studio() {
  return <RequireSession><Helmet><title>استوديو صحوة | صحوة</title><meta name="robots" content="noindex, nofollow" /></Helmet></RequireSession>;
}

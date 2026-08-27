import { useCallback, useEffect, useState } from 'react';
import * as api from '../api/endpoints';

export function useDashboard() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await api.fetchDashboard();
      setData(res.data);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, status, refresh: load };
}

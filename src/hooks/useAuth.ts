import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentProfile, type AuthProfile } from '../lib/auth';

interface UseAuthResult {
  profile: AuthProfile | null;
  loading: boolean;
  refresh: () => void;
}

export function useAuth(): UseAuthResult {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;

    getCurrentProfile()
      .then((p) => { if (active) setProfile(p); })
      .finally(() => { if (active) setLoading(false); });

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      getCurrentProfile()
        .then((p) => { if (active) setProfile(p); })
        .finally(() => { if (active) setLoading(false); });
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [version]);

  return { profile, loading, refresh: () => setVersion((v) => v + 1) };
}

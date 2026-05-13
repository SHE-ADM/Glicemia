import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Measurement, CreateMeasurement } from '@glicemia/shared';

export interface UseMeasurementsResult {
  measurements: Measurement[];
  loading: boolean;
  error: string | null;
  add: (data: CreateMeasurement) => Promise<{ error: string | null }>;
  refresh: () => void;
}

export function useMeasurements(skProfile: string | undefined): UseMeasurementsResult {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!skProfile) return;
    setLoading(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from('measurements')
      .select('*')
      .eq('sk_profile', skProfile)
      .is('deleted_at', null)
      .order('measured_at', { ascending: false })
      .limit(100);

    if (dbError) {
      setError('Erro ao carregar medições.');
    } else {
      setMeasurements((data ?? []) as Measurement[]);
    }
    setLoading(false);
  }, [skProfile]);

  useEffect(() => { refresh(); }, [refresh]);

  async function add(data: CreateMeasurement): Promise<{ error: string | null }> {
    if (!skProfile) return { error: 'Perfil não encontrado.' };

    const { error: dbError } = await supabase
      .from('measurements')
      .insert({ sk_profile: skProfile, ...data });

    if (dbError) return { error: 'Erro ao registrar medição. Verifique sua conexão.' };
    refresh();
    return { error: null };
  }

  return { measurements, loading, error, add, refresh };
}

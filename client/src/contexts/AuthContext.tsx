import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isRecoveryUrl, isAuthError } from '../lib/supabase';
import type { Profile } from '@glicemia/shared';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    const query = supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .is('deleted_at', null)
      .single()
      .then(({ data, error }) => (error ? null : (data ?? null)));

    const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 5_000));
    return await Promise.race([query, timeout]);
  } catch {
    return null;
  }
}

// Sem dependência de estado do componente — pode viver no escopo do módulo.
async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  // Limpa sessão local antes do reset para evitar token stale/corrompido
  // no header Authorization que causa TypeError no fetch do Chrome.
  await supabase.auth.signOut({ scope: 'local' }).catch(() => {});

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error?.message ?? null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao processar a requisição.';
    console.error('[sendPasswordReset] fetch threw:', err);
    return { error: msg };
  }
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // Se o link já é inválido/expirado, não há o que esperar do Supabase.
  const [loading, setLoading] = useState(!isAuthError);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const resolvePasswordUpdate = useRef<((r: { error: string | null }) => void) | null>(null);

  useEffect(() => {
    // Link expirado/inválido já detectado antes do Supabase processar a URL.
    if (isAuthError) return;

    // Listener registrado ANTES de getSession para não perder eventos já processados.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const isRecovery =
          event === 'PASSWORD_RECOVERY' ||
          (event === 'INITIAL_SESSION' && isRecoveryUrl && !!session);

        if (isRecovery) {
          setIsPasswordRecovery(true);
          setSession(session);
          setLoading(false);
          return;
        }

        if (event === 'USER_UPDATED') {
          resolvePasswordUpdate.current?.({ error: null });
          resolvePasswordUpdate.current = null;
          return;
        }

        setSession(session);
        if (session) {
          setProfile(await fetchProfile(session.user.id));
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // getSession garante loading=false mesmo se onAuthStateChange não disparar.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (isRecoveryUrl && session) {
        setIsPasswordRecovery(true);
        setSession(session);
      } else if (session) {
        setProfile(await fetchProfile(session.user.id));
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data.session) {
      setSession(data.session);
      const p = await fetchProfile(data.session.user.id);
      setProfile(p);
    }
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setIsPasswordRecovery(false);
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const result = await new Promise<{ error: string | null }>(resolve => {
      resolvePasswordUpdate.current = resolve;

      supabase.auth.updateUser({ password }).then(({ error }) => {
        if (resolvePasswordUpdate.current === resolve) {
          resolvePasswordUpdate.current = null;
          resolve({ error: error?.message ?? null });
        }
      });

      // Fallback: se USER_UPDATED e a promise do SDK não resolverem em 60s.
      setTimeout(() => {
        if (resolvePasswordUpdate.current === resolve) {
          resolvePasswordUpdate.current = null;
          resolve({ error: 'Tempo limite excedido. Solicite um novo link e tente novamente.' });
        }
      }, 60_000);
    });

    if (!result.error) {
      setIsPasswordRecovery(false);
      setSession(null);
      setProfile(null);
      // scope:'local' garante limpeza do localStorage mesmo com token expirado no servidor.
      await supabase.auth.signOut({ scope: 'local' });
    }
    return result;
  }, []);

  const contextValue = useMemo(
    () => ({ session, profile, loading, isPasswordRecovery, signIn, signOut, updatePassword, sendPasswordReset }),
    [session, profile, loading, isPasswordRecovery, signIn, signOut, updatePassword]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext deve ser usado dentro de AuthProvider');
  return ctx;
}

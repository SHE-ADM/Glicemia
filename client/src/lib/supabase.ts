import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_GLICEMIA_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_GLICEMIA_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas.');
}

// Lê hash/search antes de o Supabase apagar da URL na inicialização.
const _hash   = globalThis.location?.hash   ?? '';
const _params = new URLSearchParams(_hash.replace(/^#/, ''));

function _jwtExpired(token: string): boolean {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(b64)) as { exp?: number };
    return typeof exp === 'number' && exp < Math.floor(Date.now() / 1000);
  } catch { return false; }
}

const _accessToken   = _params.get('access_token') ?? '';
const _hasErrorHash  = _params.has('error') || _params.has('error_code');
const _tokenExpired  = !!_accessToken && _jwtExpired(_accessToken);

/** true quando o URL contém um token de recuperação válido e não expirado */
export const isRecoveryUrl =
  _params.get('type') === 'recovery' && !!_accessToken && !_tokenExpired && !_hasErrorHash;

/** true quando já sabemos que o link está inválido/expirado (não precisa esperar o Supabase) */
export const isAuthError = _hasErrorHash || _tokenExpired;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { flowType: 'implicit' },
});

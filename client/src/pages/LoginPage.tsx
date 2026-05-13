import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

export function LoginPage() {
  const { session, loading, signIn, sendPasswordReset } = useAuthContext();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-linen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 rounded-full border border-navy-500 border-t-transparent animate-spin" />
          <p className="font-sans text-xs tracking-ultra uppercase text-navy-300">
            Verificando sessão
          </p>
        </div>
      </div>
    );
  }

  if (session) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) setError('E-mail ou senha inválidos. Verifique suas credenciais.');
    setSubmitting(false);
  }

  async function handleRecovery(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await sendPasswordReset(email);
    setSubmitting(false);
    if (error) {
      setError('Erro ao enviar e-mail. Verifique o endereço e tente novamente.');
    } else {
      setRecoverySent(true);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-linen flex items-center justify-center px-4 py-16">

      {/* ── Card flutuante ─────────────────────────────────── */}
      <div className="w-full max-w-md bg-linen-50 rounded-card shadow-float-lg overflow-hidden">

        {/* Barra dourada superior */}
        <div className="h-1 bg-gold-500" />

        <div className="px-12 pt-12 pb-14">

          {/* Cabeçalho */}
          <header className="mb-10 space-y-3">
            <p className="font-sans text-xs font-700 tracking-ultra uppercase text-navy-300">
              Medidor de Glicemia
            </p>
            <h1 className="font-serif text-4xl text-navy-900 leading-tight">
              Bem-vindo<br />
              <em className="font-serif font-400 not-italic text-gold-700">de volta.</em>
            </h1>
            <p className="font-sans text-sm text-navy-300 leading-relaxed">
              Acesso restrito. Use as credenciais<br />enviadas pelo administrador.
            </p>
          </header>

          {/* Divisor */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-linen-200" />
            <span className="font-sans text-xs tracking-ultra text-navy-300">
              {recovering ? 'RECUPERAR ACESSO' : 'ENTRAR'}
            </span>
            <div className="flex-1 h-px bg-linen-200" />
          </div>

          {recoverySent ? (
            <div className="space-y-6">
              <div className="bg-status-success-bg border border-status-success rounded-input px-4 py-3">
                <p className="font-sans text-xs text-status-success leading-relaxed">
                  E-mail de recuperação enviado. Verifique sua caixa de entrada.
                </p>
              </div>
              <button
                onClick={() => { setRecovering(false); setRecoverySent(false); setError(null); }}
                className="w-full bg-navy-900 hover:bg-navy-700 text-linen-50 font-sans text-xs font-700 tracking-ultra uppercase py-4 rounded-btn transition-colors duration-300"
              >
                Voltar ao login
              </button>
            </div>
          ) : recovering ? (
            <form onSubmit={handleRecovery} className="space-y-8">
              <div className="space-y-1.5">
                <label htmlFor="email-recovery" className="block font-sans text-xs tracking-ultra uppercase text-navy-500">
                  E-mail
                </label>
                <input
                  id="email-recovery"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-transparent border-b border-linen-200 focus:border-navy-900 py-3 font-sans text-sm text-navy-900 placeholder-navy-300 outline-none transition-colors duration-300"
                />
              </div>

              {error && (
                <div className="bg-status-error-bg border border-status-error-edge rounded-input px-4 py-3">
                  <p className="font-sans text-xs text-status-error leading-relaxed">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-navy-900 hover:bg-navy-700 text-linen-50 font-sans text-xs font-700 tracking-ultra uppercase py-4 rounded-btn transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enviando…' : 'Enviar link de recuperação'}
              </button>

              <button
                type="button"
                onClick={() => { setRecovering(false); setError(null); }}
                className="w-full text-navy-400 hover:text-navy-700 font-sans text-xs tracking-ultra uppercase py-2 transition-colors duration-300"
              >
                Voltar ao login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block font-sans text-xs tracking-ultra uppercase text-navy-500"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-transparent border-b border-linen-200 focus:border-navy-900 py-3 font-sans text-sm text-navy-900 placeholder-navy-300 outline-none transition-colors duration-300"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block font-sans text-xs tracking-ultra uppercase text-navy-500"
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-linen-200 focus:border-navy-900 py-3 font-sans text-sm text-navy-900 placeholder-navy-300 outline-none transition-colors duration-300"
                />
              </div>

              {error && (
                <div className="bg-status-error-bg border border-status-error-edge rounded-input px-4 py-3">
                  <p className="font-sans text-xs text-status-error leading-relaxed">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-navy-900 hover:bg-navy-700 text-linen-50 font-sans text-xs font-700 tracking-ultra uppercase py-4 rounded-btn transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {submitting ? 'Autenticando…' : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={() => { setRecovering(true); setError(null); }}
                className="w-full text-navy-400 hover:text-navy-700 font-sans text-xs tracking-ultra uppercase py-2 transition-colors duration-300"
              >
                Esqueci minha senha
              </button>

            </form>
          )}

          {/* Rodapé */}
          <footer className="mt-12 flex items-center gap-3">
            <div className="w-4 h-px bg-gold-500" />
            <p className="font-serif italic text-xs text-navy-300">
              Monitoramento com cuidado.
            </p>
          </footer>

        </div>
      </div>

      {/* Crédito discreto */}
      <p className="fixed bottom-6 left-0 right-0 text-center font-sans text-xs text-navy-300 tracking-wide">
        Sheild · {new Date().getFullYear()}
      </p>

    </div>
  );
}

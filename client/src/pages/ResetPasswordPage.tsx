import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

function mapUpdateError(error: string): string {
  if (/same.password|different from the old/i.test(error))
    return 'A nova senha deve ser diferente da senha atual.';
  if (/tempo limite/i.test(error))
    return error;
  return 'Erro ao redefinir senha. Solicite um novo link e tente novamente.';
}

export function ResetPasswordPage() {
  const { updatePassword, signOut, isPasswordRecovery, loading } = useAuthContext();
  const navigate = useNavigate();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        setError(mapUpdateError(error));
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-linen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 rounded-full border border-navy-500 border-t-transparent animate-spin" />
          <p className="font-sans text-xs tracking-ultra uppercase text-navy-300">
            Verificando link de recuperação
          </p>
        </div>
      </div>
    );
  }

  if (!success && !isPasswordRecovery && !submitting) {
    return (
      <div className="min-h-screen bg-gradient-linen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-linen-50 rounded-card shadow-float-lg overflow-hidden">
          <div className="h-1 bg-gold-500" />
          <div className="px-12 pt-12 pb-14 space-y-6">
            <p className="font-sans text-xs font-700 tracking-ultra uppercase text-navy-300">Medidor de Glicemia</p>
            <div className="bg-status-error-bg border border-status-error-edge rounded-input px-4 py-3">
              <p className="font-sans text-xs text-status-error leading-relaxed">
                Link de recuperação inválido ou expirado. Solicite um novo link na tela de login.
              </p>
            </div>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full bg-navy-900 hover:bg-navy-700 text-linen-50 font-sans text-xs font-700 tracking-ultra uppercase py-4 rounded-btn transition-colors duration-300"
            >
              Voltar ao login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-linen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-linen-50 rounded-card shadow-float-lg overflow-hidden">
        <div className="h-1 bg-gold-500" />
        <div className="px-12 pt-12 pb-14">

          <header className="mb-10 space-y-3">
            <p className="font-sans text-xs font-700 tracking-ultra uppercase text-navy-300">
              Medidor de Glicemia
            </p>
            <h1 className="font-serif text-4xl text-navy-900 leading-tight">
              Nova<br />
              <em className="font-serif font-400 not-italic text-gold-700">senha.</em>
            </h1>
          </header>

          {success ? (
            <div className="space-y-6">
              <div className="bg-status-success-bg border border-status-success rounded-input px-4 py-3">
                <p className="font-sans text-xs text-status-success leading-relaxed">
                  Senha redefinida com sucesso.
                </p>
              </div>
              <button
                onClick={async () => { await signOut(); navigate('/login', { replace: true }); }}
                className="w-full bg-navy-900 hover:bg-navy-700 text-linen-50 font-sans text-xs font-700 tracking-ultra uppercase py-4 rounded-btn transition-colors duration-300"
              >
                Ir para o login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-1.5">
                <label htmlFor="password" className="block font-sans text-xs tracking-ultra uppercase text-navy-500">
                  Nova senha
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-linen-200 focus:border-navy-900 py-3 font-sans text-sm text-navy-900 placeholder-navy-300 outline-none transition-colors duration-300"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm" className="block font-sans text-xs tracking-ultra uppercase text-navy-500">
                  Confirmar senha
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-linen-200 focus:border-navy-900 py-3 font-sans text-sm text-navy-900 placeholder-navy-300 outline-none transition-colors duration-300"
                />
              </div>

              {error && (
                <div className="bg-status-error-bg border border-status-error rounded-input px-4 py-3">
                  <p className="font-sans text-xs text-status-error leading-relaxed">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-navy-900 hover:bg-navy-700 text-linen-50 font-sans text-xs font-700 tracking-ultra uppercase py-4 rounded-btn transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {submitting ? 'Salvando…' : 'Redefinir senha'}
              </button>
            </form>
          )}

          <footer className="mt-12 flex items-center gap-3">
            <div className="w-4 h-px bg-gold-500" />
            <p className="font-serif italic text-xs text-navy-300">
              Monitoramento com cuidado.
            </p>
          </footer>

        </div>
      </div>

      <p className="fixed bottom-6 left-0 right-0 text-center font-sans text-xs text-navy-300 tracking-wide">
        Sheild · {new Date().getFullYear()}
      </p>
    </div>
  );
}

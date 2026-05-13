import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuthContext } from '../contexts/AuthContext';
import { useMeasurements } from '../hooks/useMeasurements';
import { glucoseStatus, glucoseStatusLabel, STATUS_COLORS } from '../lib/glucose';
import type { GlucoseStatus } from '../lib/glucose';
import type { Measurement, CreateMeasurement } from '@glicemia/shared';
import { WeeklyChart } from '../components/measurements/WeeklyChart';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function localDateTimeString(date = new Date()): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateGroup(iso: string): string {
  const date = new Date(iso);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today))     return 'Hoje';
  if (sameDay(date, yesterday)) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

const PERIOD_LABEL: Record<string, string> = {
  fasting:   'Jejum',
  post_meal: 'Pós-refeição',
  other:     'Outro',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ value, status }: { value: number; status: GlucoseStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans font-medium ${STATUS_COLORS[status].badge}`}>
      {glucoseStatusLabel(value, status)}
    </span>
  );
}

function StatCard({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-gradient-card rounded-card border border-edge-default p-5 shadow-dash ${className}`}>
      <p className="font-sans text-xs text-ink-muted uppercase tracking-ultra mb-3">{label}</p>
      {children}
    </div>
  );
}

function MeasurementRow({ m }: { m: Measurement }) {
  const status = glucoseStatus(m.glucose_value, m.period);
  const colors = STATUS_COLORS[status];
  return (
    <div className="flex items-center gap-4 py-3 border-b border-edge-subtle last:border-0">
      <div className="w-12 text-right flex-shrink-0">
        <span className="font-mono text-xs text-ink-muted">{formatTime(m.measured_at)}</span>
      </div>
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.value.replace('text-', 'bg-')}`} />
      <span className="font-sans text-xs text-ink-secondary flex-shrink-0">
        {PERIOD_LABEL[m.period] ?? m.period}
      </span>
      <div className="flex-1" />
      <span className={`font-mono text-sm font-bold ${colors.value}`}>
        {m.glucose_value}
      </span>
      <span className="font-sans text-xs text-ink-muted">mg/dL</span>
      <StatusBadge value={m.glucose_value} status={status} />
    </div>
  );
}

// ── AddMeasurementModal ───────────────────────────────────────────────────────

interface AddMeasurementModalProps {
  onClose:  () => void;
  onSubmit: (data: CreateMeasurement) => Promise<string | null>;
}

function AddMeasurementModal({ onClose, onSubmit }: AddMeasurementModalProps) {
  const [value,    setValue]    = useState('');
  const [period,   setPeriod]   = useState<'fasting' | 'post_meal' | 'other'>('fasting');
  const [datetime, setDatetime] = useState(localDateTimeString());
  const [error,    setError]    = useState<string | null>(null);
  const [saving,   setSaving]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const num = parseInt(value, 10);
    if (isNaN(num) || num < 20 || num > 600) {
      setError('Informe um valor entre 20 e 600 mg/dL.');
      return;
    }
    if (!datetime) {
      setError('Informe a data e hora da medição.');
      return;
    }

    setSaving(true);
    const err = await onSubmit({
      glucose_value: num,
      period,
      measured_at: new Date(datetime).toISOString(),
    });
    setSaving(false);
    if (err) setError(err);
  }

  const periodOptions: { key: 'fasting' | 'post_meal' | 'other'; label: string }[] = [
    { key: 'fasting',   label: 'Jejum' },
    { key: 'post_meal', label: 'Pós-refeição' },
    { key: 'other',     label: 'Outro' },
  ];

  const inputClass = [
    'w-full bg-surface-overlay border border-edge-default rounded-input',
    'px-4 py-2.5 font-sans text-sm text-ink-primary placeholder-ink-faint',
    'focus:border-violet-500 focus:outline-none transition-colors duration-150',
  ].join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-md bg-surface-overlay rounded-modal shadow-dash border border-edge-default">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-edge-default">
          <div>
            <h2 className="font-sans text-base font-semibold text-ink-primary">Nova Medição</h2>
            <p className="font-sans text-xs text-ink-muted mt-0.5">Registrar valor de glicemia</p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-primary transition-colors p-1"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Glucose value */}
          <div>
            <label className="block font-sans text-xs tracking-ultra uppercase text-ink-muted mb-2">
              Valor (mg/dL)
            </label>
            <input
              type="number"
              min={20}
              max={600}
              required
              autoFocus
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Ex: 95"
              className={`${inputClass} font-mono text-2xl text-center h-14`}
            />
          </div>

          {/* Period */}
          <div>
            <label className="block font-sans text-xs tracking-ultra uppercase text-ink-muted mb-2">
              Período
            </label>
            <div className="grid grid-cols-3 gap-2">
              {periodOptions.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setPeriod(opt.key)}
                  className={[
                    'py-2.5 rounded-btn font-sans text-xs font-medium transition-colors duration-150',
                    period === opt.key
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50'
                      : 'bg-surface-raised text-ink-secondary border border-edge-default hover:border-edge-strong hover:text-ink-primary',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date/time */}
          <div>
            <label className="block font-sans text-xs tracking-ultra uppercase text-ink-muted mb-2">
              Data e hora
            </label>
            <input
              type="datetime-local"
              required
              value={datetime}
              max={localDateTimeString()}
              onChange={e => setDatetime(e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-status-error-bg border border-status-error-edge rounded-input px-4 py-2.5">
              <p className="font-sans text-xs text-status-error">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-primary text-white font-sans text-xs font-semibold tracking-ultra uppercase py-3.5 rounded-btn shadow-glow hover:shadow-glow-lg transition-shadow duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Registrando…' : 'Registrar Medição'}
          </button>

        </form>
      </div>
    </div>
  );
}

// ── DashboardPage ─────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { profile } = useAuthContext();
  const { measurements, loading, add } = useMeasurements(profile?.sk_profile);
  const [showForm, setShowForm] = useState(false);

  const lastReading = measurements[0] ?? null;
  const todayStr    = new Date().toISOString().slice(0, 10);
  const todayMeas   = measurements.filter(m => m.measured_at.slice(0, 10) === todayStr);
  const todayAvg    = todayMeas.length > 0
    ? Math.round(todayMeas.reduce((acc, m) => acc + m.glucose_value, 0) / todayMeas.length)
    : null;

  const lastStatus  = lastReading ? glucoseStatus(lastReading.glucose_value, lastReading.period) : null;
  const lastColors  = lastStatus ? STATUS_COLORS[lastStatus] : null;

  // Group measurements by date label
  const groups: { label: string; items: Measurement[] }[] = [];
  for (const m of measurements) {
    const label = formatDateGroup(m.measured_at);
    const existing = groups.find(g => g.label === label);
    if (existing) existing.items.push(m);
    else groups.push({ label, items: [m] });
  }

  const canAdd = profile?.role === 'user' || profile?.role === 'admin';

  return (
    <DashboardLayout>

      {/* ── Greeting ───────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="font-sans text-xs text-ink-muted uppercase tracking-ultra">
          {getGreeting()}
        </p>
        <h1 className="font-sans text-2xl font-bold text-ink-primary mt-1">
          {profile?.full_name?.split(' ')[0] ?? 'Usuário'}
        </h1>
        <p className="font-sans text-xs text-ink-muted mt-0.5">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

        {/* Last reading */}
        <StatCard label="Última leitura" className="sm:col-span-1">
          {loading ? (
            <div className="h-12 flex items-center">
              <div className="w-4 h-4 rounded-full border border-violet-500 border-t-transparent animate-spin" />
            </div>
          ) : lastReading ? (
            <>
              <div className={`flex items-end gap-2 mb-2 ${lastColors!.glow}`}>
                <span className={`font-mono text-4xl font-bold leading-none ${lastColors!.value}`}>
                  {lastReading.glucose_value}
                </span>
                <span className="font-sans text-xs text-ink-muted mb-1">mg/dL</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge value={lastReading.glucose_value} status={lastStatus!} />
                <span className="font-sans text-xs text-ink-muted">
                  {PERIOD_LABEL[lastReading.period]} · {formatTime(lastReading.measured_at)}
                </span>
              </div>
            </>
          ) : (
            <p className="font-sans text-sm text-ink-muted">Nenhuma medição registrada.</p>
          )}
        </StatCard>

        {/* Today count */}
        <StatCard label="Medições hoje">
          <div className="flex items-end gap-2">
            <span className="font-mono text-4xl font-bold text-ink-primary leading-none">
              {todayMeas.length}
            </span>
            <span className="font-sans text-xs text-ink-muted mb-1">registros</span>
          </div>
          <p className="font-sans text-xs text-ink-muted mt-1">
            {todayMeas.length === 0 ? 'Nenhuma hoje' : `Última às ${formatTime(todayMeas[0].measured_at)}`}
          </p>
        </StatCard>

        {/* Today average */}
        <StatCard label="Média do dia">
          {todayAvg !== null ? (
            <>
              <div className="flex items-end gap-2">
                <span className={`font-mono text-4xl font-bold leading-none ${
                  STATUS_COLORS[glucoseStatus(todayAvg, 'other')].value
                }`}>
                  {todayAvg}
                </span>
                <span className="font-sans text-xs text-ink-muted mb-1">mg/dL</span>
              </div>
              <p className="font-sans text-xs text-ink-muted mt-1">
                Baseado em {todayMeas.length} medição{todayMeas.length !== 1 ? 'ões' : ''}
              </p>
            </>
          ) : (
            <p className="font-sans text-sm text-ink-muted">Sem dados de hoje.</p>
          )}
        </StatCard>
      </div>

      {/* ── Weekly chart ───────────────────────────────────────────── */}
      <div className="mb-8">
        <WeeklyChart measurements={measurements} />
      </div>

      {/* ── Add measurement button ──────────────────────────────────── */}
      {canAdd && (
        <div className="mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2.5 bg-gradient-primary text-white font-sans text-xs font-semibold tracking-ultra uppercase px-6 py-3 rounded-btn shadow-glow hover:shadow-glow-lg transition-shadow duration-200"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Registrar Medição
          </button>
        </div>
      )}

      {/* ── Measurements history ────────────────────────────────────── */}
      {loading && measurements.length === 0 ? (
        <div className="flex items-center gap-3 text-ink-muted py-8">
          <div className="w-4 h-4 rounded-full border border-violet-500 border-t-transparent animate-spin" />
          <span className="font-sans text-sm">Carregando medições…</span>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-gradient-card rounded-card border border-edge-default p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-raised border border-edge-default flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-ink-muted">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="font-sans text-sm text-ink-secondary font-medium mb-1">Nenhuma medição registrada</p>
          <p className="font-sans text-xs text-ink-muted">
            {canAdd ? 'Use o botão acima para registrar sua primeira leitura.' : 'Aguardando registros.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(group => (
            <div key={group.label}>
              <div className="flex items-center gap-3 mb-2">
                <p className="font-sans text-xs font-semibold text-ink-muted uppercase tracking-ultra">
                  {group.label}
                </p>
                <div className="flex-1 h-px bg-edge-default" />
                <span className="font-sans text-[10px] text-ink-faint">
                  {group.items.length} medição{group.items.length !== 1 ? 'ões' : ''}
                </span>
              </div>
              <div className="bg-gradient-card rounded-card border border-edge-default px-4 shadow-dash-sm">
                {group.items.map(m => (
                  <MeasurementRow key={m.sk_measurement ?? m.measured_at} m={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add measurement modal ───────────────────────────────────── */}
      {showForm && (
        <AddMeasurementModal
          onClose={() => setShowForm(false)}
          onSubmit={async (data) => {
            const { error } = await add(data);
            if (!error) setShowForm(false);
            return error;
          }}
        />
      )}

    </DashboardLayout>
  );
}

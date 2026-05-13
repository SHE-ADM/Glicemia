import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceArea, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { glucoseStatus, glucoseStatusLabel, STATUS_COLORS } from '../../lib/glucose';
import type { Measurement } from '@glicemia/shared';

// ── Data preparation ──────────────────────────────────────────────────────────

interface ChartPoint {
  date:    string;
  label:   string;
  avg:     number | null;
  min:     number | null;
  max:     number | null;
  count:   number;
  isToday: boolean;
}

function prepareChartData(measurements: Measurement[]): ChartPoint[] {
  const points: ChartPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const dayMeas = measurements.filter(m => m.measured_at.slice(0, 10) === dateStr);
    const values  = dayMeas.map(m => m.glucose_value);

    points.push({
      date:    dateStr,
      label:   i === 0 ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      avg:     values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null,
      min:     values.length > 0 ? Math.min(...values) : null,
      max:     values.length > 0 ? Math.max(...values) : null,
      count:   values.length,
      isToday: i === 0,
    });
  }

  return points;
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?:  boolean;
  payload?: Array<{ value?: number; payload?: ChartPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as ChartPoint;
  if (!point || point.avg === null) return null;

  const status = glucoseStatus(point.avg, 'other');
  const colors = STATUS_COLORS[status];

  return (
    <div className="bg-surface-overlay border border-edge-default rounded-card px-4 py-3 shadow-dash text-left min-w-[140px]">
      <p className="font-sans text-xs text-ink-muted mb-2">
        {new Date(point.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
      </p>
      <p className={`font-mono text-xl font-bold leading-none mb-1 ${colors.value}`}>
        {point.avg} <span className="text-xs font-sans font-normal text-ink-muted">mg/dL</span>
      </p>
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-sans font-medium ${colors.badge}`}>
        {glucoseStatusLabel(point.avg, status)}
      </span>
      {(point.min !== null && point.max !== null && point.min !== point.max) && (
        <p className="font-sans text-xs text-ink-muted mt-2">
          Variação: {point.min} – {point.max}
        </p>
      )}
      <p className="font-sans text-xs text-ink-muted mt-0.5">
        {point.count} medição{point.count !== 1 ? 'ões' : ''}
      </p>
    </div>
  );
}

// ── Custom dot (highlights today and status color) ────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDot(props: any) {
  const { cx, cy, payload } = props as { cx: number; cy: number; payload: ChartPoint };
  if (payload.avg === null || cx === undefined || cy === undefined) return null;

  const status = glucoseStatus(payload.avg, 'other');
  const colorMap: Record<string, string> = {
    normal:  '#14CA74',
    warning: '#FDB52A',
    danger:  '#FF5A65',
  };
  const color = colorMap[status];

  return (
    <circle
      cx={cx}
      cy={cy}
      r={payload.isToday ? 5 : 4}
      fill={color}
      stroke={payload.isToday ? color : 'transparent'}
      strokeWidth={payload.isToday ? 4 : 0}
      strokeOpacity={0.3}
    />
  );
}

// ── WeeklyChart ───────────────────────────────────────────────────────────────

interface WeeklyChartProps {
  measurements: Measurement[];
}

export function WeeklyChart({ measurements }: WeeklyChartProps) {
  const data = prepareChartData(measurements);
  const hasData = data.some(d => d.avg !== null);

  if (!hasData) {
    return (
      <div className="bg-gradient-card rounded-card border border-edge-default p-6 shadow-dash">
        <h2 className="font-sans text-xs font-semibold text-ink-muted uppercase tracking-ultra mb-4">
          Tendência — 7 dias
        </h2>
        <div className="h-40 flex items-center justify-center">
          <p className="font-sans text-sm text-ink-muted">Sem dados para o período.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-card rounded-card border border-edge-default p-5 lg:p-6 shadow-dash">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-sans text-xs font-semibold text-ink-muted uppercase tracking-ultra">
            Tendência — 7 dias
          </h2>
          <p className="font-sans text-xs text-ink-faint mt-0.5">
            Média diária · mg/dL
          </p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4">
          {([
            { color: 'bg-glucose-normal',  label: 'Normal' },
            { color: 'bg-glucose-warning', label: 'Atenção' },
            { color: 'bg-glucose-danger',  label: 'Alto/Baixo' },
          ] as const).map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="font-sans text-[10px] text-ink-muted">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="glucoseAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#CB3CFF" stopOpacity={0.20} />
              <stop offset="95%" stopColor="#CB3CFF" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Glucose reference zones */}
          <ReferenceArea y1={0}   y2={70}  fill="rgba(255,90,101,0.07)"  strokeWidth={0} />
          <ReferenceArea y1={70}  y2={140} fill="rgba(20,202,116,0.05)"  strokeWidth={0} />
          <ReferenceArea y1={140} y2={180} fill="rgba(253,181,42,0.05)"  strokeWidth={0} />
          <ReferenceArea y1={180} y2={500} fill="rgba(255,90,101,0.05)"  strokeWidth={0} />

          {/* Threshold lines */}
          <ReferenceLine y={70}  stroke="#FF5A65" strokeDasharray="4 3" strokeOpacity={0.35} strokeWidth={1} />
          <ReferenceLine y={140} stroke="#FDB52A" strokeDasharray="4 3" strokeOpacity={0.35} strokeWidth={1} />
          <ReferenceLine y={180} stroke="#FF5A65" strokeDasharray="4 3" strokeOpacity={0.35} strokeWidth={1} />

          <CartesianGrid
            vertical={false}
            stroke="#2D3748"
            strokeDasharray="0"
            strokeOpacity={0.6}
          />

          <XAxis
            dataKey="label"
            tick={{ fill: '#7E89AC', fontSize: 11, fontFamily: 'inherit' }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />

          <YAxis
            domain={[40, (dataMax: number) => Math.max(dataMax + 40, 220)]}
            tick={{ fill: '#7E89AC', fontSize: 10, fontFamily: 'inherit' }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v: number) => `${v}`}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#4A5568', strokeWidth: 1, strokeDasharray: '4 2' }}
          />

          <Area
            type="monotone"
            dataKey="avg"
            stroke="#CB3CFF"
            strokeWidth={2}
            fill="url(#glucoseAreaGrad)"
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: '#CB3CFF', stroke: '#CB3CFF', strokeWidth: 3, strokeOpacity: 0.3 }}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Day summary pills */}
      <div className="grid grid-cols-7 gap-1 mt-4">
        {data.map(point => {
          const status = point.avg !== null ? glucoseStatus(point.avg, 'other') : null;
          const dotColor = status ? {
            normal:  'bg-glucose-normal',
            warning: 'bg-glucose-warning',
            danger:  'bg-glucose-danger',
          }[status] : 'bg-edge-default';

          return (
            <div
              key={point.date}
              className={[
                'flex flex-col items-center gap-1 py-1.5 rounded-btn',
                point.isToday ? 'bg-surface-raised border border-edge-default' : '',
              ].join(' ')}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              <span className={`font-sans text-[9px] ${point.isToday ? 'text-ink-secondary font-semibold' : 'text-ink-faint'}`}>
                {point.label}
              </span>
              {point.avg !== null ? (
                <span className="font-mono text-[10px] text-ink-muted">{point.avg}</span>
              ) : (
                <span className="font-sans text-[10px] text-ink-faint">—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

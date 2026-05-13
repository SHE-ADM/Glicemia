export type GlucoseStatus = 'normal' | 'warning' | 'danger';

// Thresholds based on ISPAD/ADA clinical guidelines.
// These will eventually be driven by the alert_config table (configurable by admin).
export function glucoseStatus(value: number, period: string): GlucoseStatus {
  if (value < 70) return 'danger';
  if (period === 'fasting') {
    if (value <= 100) return 'normal';
    if (value <= 125) return 'warning';
    return 'danger';
  }
  if (period === 'post_meal') {
    if (value <= 140) return 'normal';
    if (value <= 180) return 'warning';
    return 'danger';
  }
  // period === 'other'
  if (value <= 140) return 'normal';
  if (value <= 180) return 'warning';
  return 'danger';
}

export function glucoseStatusLabel(value: number, status: GlucoseStatus): string {
  if (status === 'normal') return 'Normal';
  if (status === 'warning') return 'Atenção';
  return value < 70 ? 'Baixo' : 'Alto';
}

export const STATUS_COLORS: Record<GlucoseStatus, { value: string; badge: string; border: string; glow: string }> = {
  normal: {
    value:  'text-glucose-normal',
    badge:  'bg-status-success-bg text-glucose-normal border border-glucose-normal',
    border: 'border-glucose-normal',
    glow:   'shadow-glow-normal',
  },
  warning: {
    value:  'text-glucose-warning',
    badge:  'bg-status-warning-bg text-glucose-warning border border-glucose-warning',
    border: 'border-glucose-warning',
    glow:   'shadow-glow-warning',
  },
  danger: {
    value:  'text-glucose-danger',
    badge:  'bg-status-error-bg text-glucose-danger border border-status-error-edge',
    border: 'border-status-error-edge',
    glow:   'shadow-glow-danger',
  },
};

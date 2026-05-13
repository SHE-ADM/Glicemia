import { z } from 'zod';

export const periodSchema = z.enum(['fasting', 'post_meal', 'other']);

export type Period = z.infer<typeof periodSchema>;

export const measurementSchema = z.object({
  sk_measurement: z.string().uuid().optional(),
  sk_profile: z.string().uuid(),
  glucose_value: z
    .number()
    .int()
    .min(1, 'Valor de glicose inválido')
    .max(1000, 'Valor de glicose inválido'),
  period: periodSchema,
  measured_at: z.string().datetime(),
  created_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
});

export type Measurement = z.infer<typeof measurementSchema>;

export const createMeasurementSchema = measurementSchema.pick({
  glucose_value: true,
  period: true,
  measured_at: true,
});

export type CreateMeasurement = z.infer<typeof createMeasurementSchema>;

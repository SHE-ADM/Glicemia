-- V003__extended_schema.sql
-- she-glicemia — schema estendido
-- Baseado nos principais apps de glicemia (mySugr, Glucose Buddy, One Drop, LibreView)
-- Aplicado manualmente via Supabase SQL Editor em 2026-05-12

-- ============================================================
-- ALTER: adicionar notes em measurements
-- ============================================================
ALTER TABLE measurements ADD COLUMN notes TEXT;

-- ============================================================
-- TABELA: insulin_types — catálogo de tipos de insulina
-- ============================================================
CREATE TABLE insulin_types (
  sk_insulin_type UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  category        TEXT        NOT NULL CHECK (category IN ('basal', 'bolus', 'mixed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

INSERT INTO insulin_types (name, category) VALUES
  ('Tresiba',    'basal'),
  ('Lantus',     'basal'),
  ('Basaglar',   'basal'),
  ('NovoRapid',  'bolus'),
  ('Humalog',    'bolus'),
  ('Apidra',     'bolus'),
  ('Ryzodeg',    'mixed');

-- ============================================================
-- TABELA: insulin_doses — doses aplicadas por medição
-- ============================================================
CREATE TABLE insulin_doses (
  sk_insulin_dose UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  sk_profile      UUID         NOT NULL REFERENCES profiles(sk_profile),
  sk_insulin_type UUID         NOT NULL REFERENCES insulin_types(sk_insulin_type),
  dose_units      NUMERIC(6,2) NOT NULL CHECK (dose_units > 0),
  administered_at TIMESTAMPTZ  NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_insulin_doses_profile_time
  ON insulin_doses(sk_profile, administered_at DESC)
  WHERE deleted_at IS NULL;

-- ============================================================
-- TABELA: meals — refeições e carboidratos
-- ============================================================
CREATE TABLE meals (
  sk_meal      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  sk_profile   UUID         NOT NULL REFERENCES profiles(sk_profile),
  description  TEXT,
  carbs_grams  NUMERIC(6,1) CHECK (carbs_grams >= 0),
  meal_time    TIMESTAMPTZ  NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

CREATE INDEX idx_meals_profile_time
  ON meals(sk_profile, meal_time DESC)
  WHERE deleted_at IS NULL;

-- ============================================================
-- TABELA: activities — atividade física
-- ============================================================
CREATE TABLE activities (
  sk_activity      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sk_profile       UUID        NOT NULL REFERENCES profiles(sk_profile),
  activity_type    TEXT        NOT NULL,
  duration_minutes INTEGER     NOT NULL CHECK (duration_minutes > 0),
  intensity        TEXT        NOT NULL CHECK (intensity IN ('low', 'moderate', 'high')),
  started_at       TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE INDEX idx_activities_profile_time
  ON activities(sk_profile, started_at DESC)
  WHERE deleted_at IS NULL;

-- ============================================================
-- TABELA: a1c_results — hemoglobina glicada (exame periódico)
-- ============================================================
CREATE TABLE a1c_results (
  sk_a1c        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  sk_profile    UUID         NOT NULL REFERENCES profiles(sk_profile),
  value_percent NUMERIC(4,2) NOT NULL CHECK (value_percent BETWEEN 3 AND 20),
  measured_at   DATE         NOT NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- ============================================================
-- TABELA: reminder_config — horários de lembrete configuráveis
-- ============================================================
CREATE TABLE reminder_config (
  sk_reminder   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  label         TEXT        NOT NULL,
  reminder_time TIME        NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ,
  deleted_at    TIMESTAMPTZ
);

INSERT INTO reminder_config (label, reminder_time) VALUES
  ('Antes do café da manhã', '07:00'),
  ('Antes do almoço',        '12:00'),
  ('Antes do jantar',        '18:00'),
  ('Antes de dormir',        '22:00');

-- ============================================================
-- TABELA: push_subscriptions — assinaturas Web Push por dispositivo
-- ============================================================
CREATE TABLE push_subscriptions (
  sk_subscription UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sk_profile      UUID        NOT NULL REFERENCES profiles(sk_profile),
  endpoint        TEXT        NOT NULL,
  p256dh          TEXT        NOT NULL,
  auth_key        TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_push_endpoint
  ON push_subscriptions(endpoint)
  WHERE deleted_at IS NULL;

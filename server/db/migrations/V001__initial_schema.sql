-- V001__initial_schema.sql
-- she-glicemia — schema inicial
-- Tabelas: profiles, measurements, alert_config, audit_log
-- Ordem: set_updated_at → profiles → get_my_role → demais tabelas → triggers → RLS → seed

-- ============================================================
-- FUNÇÃO: atualiza updated_at antes de UPDATE (sem dependências)
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- TABELA: profiles
-- Estende auth.users com nome e role de acesso
-- ============================================================
CREATE TABLE profiles (
  sk_profile  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT        NOT NULL,
  role        TEXT        NOT NULL CHECK (role IN ('admin', 'user', 'readonly')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ,
  deleted_at  TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_profiles_auth_id
  ON profiles(id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- FUNÇÃO: retorna role do usuário autenticado (depende de profiles)
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM   profiles
  WHERE  id         = auth.uid()
  AND    deleted_at IS NULL
  LIMIT  1;
$$;

-- ============================================================
-- TABELA: measurements
-- Medições de glicose — campo period obrigatório para
-- classificação correta por contexto (jejum vs pós-refeição)
-- ============================================================
CREATE TABLE measurements (
  sk_measurement  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sk_profile      UUID        NOT NULL REFERENCES profiles(sk_profile),
  glucose_value   INTEGER     NOT NULL CHECK (glucose_value BETWEEN 1 AND 1000),
  period          TEXT        NOT NULL CHECK (period IN ('fasting', 'post_meal', 'other')),
  measured_at     TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_measurements_profile_time
  ON measurements(sk_profile, measured_at DESC)
  WHERE deleted_at IS NULL;

-- ============================================================
-- TABELA: alert_config
-- Faixas de referência configuráveis pelos admins.
-- period NULL = aplica a todos os períodos (ex.: hipoglicemia)
-- ============================================================
CREATE TABLE alert_config (
  sk_alert_config UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  label           TEXT        NOT NULL,
  period          TEXT        CHECK (period IN ('fasting', 'post_meal', 'other')),
  min_value       INTEGER,
  max_value       INTEGER,
  color           TEXT        NOT NULL CHECK (color IN ('green', 'yellow', 'red', 'dark_red')),
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ
);

CREATE TRIGGER trg_alert_config_updated_at
  BEFORE UPDATE ON alert_config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABELA: audit_log
-- Rastro imutável de alterações — sem RLS de escrita direta
-- ============================================================
CREATE TABLE audit_log (
  sk_audit_log  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name    TEXT        NOT NULL,
  record_id     UUID        NOT NULL,
  action        TEXT        NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data      JSONB,
  new_data      JSONB,
  performed_by  UUID        REFERENCES profiles(sk_profile),
  performed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_table_record
  ON audit_log(table_name, record_id);

CREATE INDEX idx_audit_log_performed_at
  ON audit_log(performed_at DESC);

-- ============================================================
-- TRIGGER DE AUDITORIA em measurements
-- ============================================================
CREATE OR REPLACE FUNCTION audit_record_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_performed_by UUID;
  v_record_id    UUID;
BEGIN
  SELECT sk_profile INTO v_performed_by
  FROM   profiles
  WHERE  id         = auth.uid()
  AND    deleted_at IS NULL
  LIMIT  1;

  IF TG_OP = 'DELETE' THEN
    v_record_id := OLD.sk_measurement;
    INSERT INTO audit_log (table_name, record_id, action, old_data, performed_by)
    VALUES (TG_TABLE_NAME, v_record_id, 'DELETE', to_jsonb(OLD), v_performed_by);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    v_record_id := NEW.sk_measurement;
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, performed_by)
    VALUES (TG_TABLE_NAME, v_record_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), v_performed_by);
    RETURN NEW;
  ELSE
    v_record_id := NEW.sk_measurement;
    INSERT INTO audit_log (table_name, record_id, action, new_data, performed_by)
    VALUES (TG_TABLE_NAME, v_record_id, 'INSERT', to_jsonb(NEW), v_performed_by);
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER trg_audit_measurements
  AFTER INSERT OR UPDATE OR DELETE ON measurements
  FOR EACH ROW EXECUTE FUNCTION audit_record_changes();

-- ============================================================
-- RLS — Row Level Security
-- ============================================================
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log    ENABLE ROW LEVEL SECURITY;

-- profiles: leitura para todos autenticados
CREATE POLICY profiles_select
  ON profiles FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- profiles: admin gerencia todos
CREATE POLICY profiles_admin_all
  ON profiles FOR ALL TO authenticated
  USING    (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- profiles: user atualiza apenas o próprio perfil
CREATE POLICY profiles_user_update_own
  ON profiles FOR UPDATE TO authenticated
  USING    (id = auth.uid() AND get_my_role() = 'user')
  WITH CHECK (id = auth.uid() AND get_my_role() = 'user');

-- measurements: admin acessa tudo
CREATE POLICY measurements_admin_all
  ON measurements FOR ALL TO authenticated
  USING    (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- measurements: user lê e registra as próprias medições
CREATE POLICY measurements_user_own
  ON measurements FOR ALL TO authenticated
  USING    (sk_profile = (SELECT sk_profile FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1)
            AND get_my_role() = 'user')
  WITH CHECK (sk_profile = (SELECT sk_profile FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1)
            AND get_my_role() = 'user');

-- measurements: readonly só lê
CREATE POLICY measurements_readonly_select
  ON measurements FOR SELECT TO authenticated
  USING (get_my_role() = 'readonly' AND deleted_at IS NULL);

-- alert_config: todos autenticados leem
CREATE POLICY alert_config_select
  ON alert_config FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- alert_config: apenas admin escreve
CREATE POLICY alert_config_admin_write
  ON alert_config FOR ALL TO authenticated
  USING    (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- audit_log: apenas admin lê
CREATE POLICY audit_log_admin_select
  ON audit_log FOR SELECT TO authenticated
  USING (get_my_role() = 'admin');

-- ============================================================
-- SEED DATA — alert_config (faixas padrão)
-- Valores baseados nas premissas do projeto.
-- PENDENTE: faixa "crítico" aguarda definição médica.
-- ============================================================
INSERT INTO alert_config (name, label, period, min_value, max_value, color, sort_order)
VALUES
  ('hypoglycemia',           'Hipoglicemia',               NULL,        NULL, 69,   'red',    1),
  ('normal_fasting',         'Normal (jejum)',              'fasting',   70,   90,   'green',  2),
  ('hyperglycemia_fasting',  'Hiperglicemia (jejum)',       'fasting',   91,   NULL, 'yellow', 3),
  ('normal_post_meal',       'Normal (pós-refeição)',       'post_meal', 70,   140,  'green',  2),
  ('hyperglycemia_post_meal','Hiperglicemia (pós-refeição)','post_meal', 141,  NULL, 'yellow', 3),
  ('normal_other',           'Normal',                     'other',     70,   140,  'green',  2),
  ('hyperglycemia_other',    'Hiperglicemia',              'other',     141,  NULL, 'yellow', 3);

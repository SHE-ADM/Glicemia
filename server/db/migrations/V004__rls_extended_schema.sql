-- V004__rls_extended_schema.sql
-- RLS para tabelas criadas na V003 (schema estendido)

ALTER TABLE insulin_types      ENABLE ROW LEVEL SECURITY;
ALTER TABLE insulin_doses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE a1c_results        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_config    ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- insulin_types: catálogo — todos leem, admin escreve
CREATE POLICY insulin_types_select ON insulin_types FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY insulin_types_admin  ON insulin_types FOR ALL    TO authenticated USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- insulin_doses
CREATE POLICY insulin_doses_admin    ON insulin_doses FOR ALL    TO authenticated USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY insulin_doses_user_own ON insulin_doses FOR ALL    TO authenticated
  USING    (sk_profile = (SELECT sk_profile FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1) AND get_my_role() = 'user')
  WITH CHECK (sk_profile = (SELECT sk_profile FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1) AND get_my_role() = 'user');
CREATE POLICY insulin_doses_readonly ON insulin_doses FOR SELECT TO authenticated USING (get_my_role() = 'readonly' AND deleted_at IS NULL);

-- meals
CREATE POLICY meals_admin    ON meals FOR ALL    TO authenticated USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY meals_user_own ON meals FOR ALL    TO authenticated
  USING    (sk_profile = (SELECT sk_profile FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1) AND get_my_role() = 'user')
  WITH CHECK (sk_profile = (SELECT sk_profile FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1) AND get_my_role() = 'user');
CREATE POLICY meals_readonly ON meals FOR SELECT TO authenticated USING (get_my_role() = 'readonly' AND deleted_at IS NULL);

-- activities
CREATE POLICY activities_admin    ON activities FOR ALL    TO authenticated USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY activities_user_own ON activities FOR ALL    TO authenticated
  USING    (sk_profile = (SELECT sk_profile FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1) AND get_my_role() = 'user')
  WITH CHECK (sk_profile = (SELECT sk_profile FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1) AND get_my_role() = 'user');
CREATE POLICY activities_readonly ON activities FOR SELECT TO authenticated USING (get_my_role() = 'readonly' AND deleted_at IS NULL);

-- a1c_results
CREATE POLICY a1c_admin    ON a1c_results FOR ALL    TO authenticated USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY a1c_user_own ON a1c_results FOR ALL    TO authenticated
  USING    (sk_profile = (SELECT sk_profile FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1) AND get_my_role() = 'user')
  WITH CHECK (sk_profile = (SELECT sk_profile FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1) AND get_my_role() = 'user');
CREATE POLICY a1c_readonly ON a1c_results FOR SELECT TO authenticated USING (get_my_role() = 'readonly' AND deleted_at IS NULL);

-- reminder_config: todos leem, admin escreve
CREATE POLICY reminder_select ON reminder_config FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY reminder_admin  ON reminder_config FOR ALL    TO authenticated USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- push_subscriptions: admin tudo; user próprio; readonly sem acesso
CREATE POLICY push_admin    ON push_subscriptions FOR ALL TO authenticated USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY push_user_own ON push_subscriptions FOR ALL TO authenticated
  USING    (sk_profile = (SELECT sk_profile FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1) AND get_my_role() = 'user')
  WITH CHECK (sk_profile = (SELECT sk_profile FROM profiles WHERE id = auth.uid() AND deleted_at IS NULL LIMIT 1) AND get_my_role() = 'user');

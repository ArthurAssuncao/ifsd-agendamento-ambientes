-- Ativar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de agendamentos (se não existir)
CREATE TABLE IF NOT EXISTS environment_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  environment_id TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN (
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  )),
  time_slot TEXT NOT NULL CHECK (time_slot ~ '^[0-9]{2}:[0-9]{2}$'),
  activity_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  booking_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ativar Row Level Security
ALTER TABLE environment_schedule ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "schedule_select_policy" 
ON environment_schedule
FOR SELECT USING (
  auth.uid() = user_id OR
  auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "schedule_insert_policy"
ON environment_schedule
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "schedule_update_policy"
ON environment_schedule
FOR UPDATE USING (
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);

-- Índices para melhorar performance
CREATE INDEX idx_environment_schedule_user ON environment_schedule(user_id);
CREATE INDEX idx_environment_schedule_week ON environment_schedule(week_number);
CREATE INDEX idx_environment_schedule_env ON environment_schedule(environment_id);

-- Todos podem ler agendamentos, mas sem dados sensíveis
CREATE POLICY "allow_public_read" 
ON environment_schedule
FOR SELECT
USING (true);

-- Apenas usuários autenticados podem criar agendamentos
CREATE POLICY "allow_insert_to_authenticated"
ON environment_schedule
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  user_id = auth.uid() -- Garante que o user_id seja do usuário logado
);

-- Dono do agendamento ou admin pode editar
CREATE POLICY "allow_update_to_owner_or_admin"
ON environment_schedule
FOR UPDATE
USING (
  user_id = auth.uid() OR
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  user_id = auth.uid() OR
  auth.jwt() ->> 'role' = 'admin'
);

-- Apenas dono ou admin pode deletar
CREATE POLICY "allow_delete_to_owner_or_admin"
ON environment_schedule
FOR DELETE
USING (
  user_id = auth.uid() OR
  auth.jwt() ->> 'role' = 'admin'
);

CREATE OR REPLACE FUNCTION update_env_schedule_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_env_schedule_updated
BEFORE UPDATE ON environment_schedule
FOR EACH ROW
EXECUTE FUNCTION update_env_schedule_timestamp();

-- Tabela staff_activities
-- Cria a tabela sem chave estrangeira
CREATE TABLE staff_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,  -- Campo opcional, não é mais FOREIGN KEY
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subjects TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cria índices para otimização
CREATE INDEX idx_staff_activities_email ON staff_activities(email);
CREATE INDEX idx_staff_activities_user_id ON staff_activities(user_id);

-- Ativa o Row Level Security
ALTER TABLE staff_activities ENABLE ROW LEVEL SECURITY;

-- Política: Todos autenticados podem ler (exceto email)
CREATE POLICY "enable_read_access_for_authenticated" 
ON staff_activities
FOR SELECT
TO authenticated
USING (true);

-- Política: Dono ou admin pode ver email completo
CREATE POLICY "enable_email_access_for_owner" 
ON staff_activities
FOR SELECT
USING (
  auth.jwt() ->> 'email' = email OR  -- Validação por email
  auth.jwt() ->> 'role' = 'admin'
);

-- Política: Dono pode editar apenas seu registro
CREATE POLICY "enable_update_for_owner"
ON staff_activities
FOR UPDATE
USING (auth.jwt() ->> 'email' = email)  -- Validação por email
WITH CHECK (auth.jwt() ->> 'email' = email);

-- Política: Apenas admins podem inserir
CREATE POLICY "enable_insert_for_admins"
ON staff_activities
FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- Política: Apenas admins podem deletar
CREATE POLICY "enable_delete_for_admins"
ON staff_activities
FOR DELETE
USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Função e trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_staff_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_staff_activities_updated_at
BEFORE UPDATE ON staff_activities
FOR EACH ROW
EXECUTE FUNCTION update_staff_activities_updated_at();


-- Atualiza os user_id para os usuários já registrados no auth.users (opcional)
UPDATE staff_activities sa
SET user_id = u.id
FROM auth.users u
WHERE sa.email = u.email;
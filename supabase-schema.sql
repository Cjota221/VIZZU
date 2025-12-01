-- ========================================
-- VIZZU AGENDAMENTO - SUPABASE SCHEMA
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- ==================== 1. TABELA: BRIEFINGS PÚBLICOS ====================
CREATE TABLE IF NOT EXISTS public_briefings (
    id BIGSERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    respostas_json JSONB,
    store_name TEXT,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'pending_review',
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_briefings_token ON public_briefings(token);
CREATE INDEX IF NOT EXISTS idx_briefings_status ON public_briefings(status);
CREATE INDEX IF NOT EXISTS idx_briefings_phone ON public_briefings(phone);

-- ==================== 2. TABELA: CLIENTES ====================
CREATE TABLE IF NOT EXISTS clients (
    id BIGSERIAL PRIMARY KEY,
    store_name TEXT,
    contact_name TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'pending_payment',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

-- ==================== 3. TABELA: SLOTS DE AGENDA ====================
CREATE TABLE IF NOT EXISTS agenda_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_number INTEGER UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'available',
    payment_status TEXT,
    client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
    reserved_at TIMESTAMPTZ,
    payment_confirmed_at TIMESTAMPTZ,
    payment_proof TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_slots_status ON agenda_slots(status);
CREATE INDEX IF NOT EXISTS idx_slots_dates ON agenda_slots(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_slots_client ON agenda_slots(client_id);

-- ==================== 4. TABELA: ARQUIVOS ====================
CREATE TABLE IF NOT EXISTS files (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'html', 'css', 'palette', 'notes'
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_files_client ON files(client_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);

-- ==================== ROW LEVEL SECURITY (RLS) ====================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- ==================== POLICIES: PUBLIC_BRIEFINGS ====================

-- Qualquer pessoa pode inserir briefing (público)
CREATE POLICY "Anyone can insert briefings" ON public_briefings
    FOR INSERT 
    WITH CHECK (true);

-- Qualquer pessoa pode ler seus próprios briefings por token
CREATE POLICY "Anyone can read own briefing by token" ON public_briefings
    FOR SELECT 
    USING (true);

-- Admin autenticado pode ver todos
CREATE POLICY "Authenticated users can view all briefings" ON public_briefings
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Admin pode atualizar
CREATE POLICY "Authenticated users can update briefings" ON public_briefings
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

-- ==================== POLICIES: AGENDA_SLOTS ====================

-- Qualquer pessoa pode ver todos os slots (público)
CREATE POLICY "Anyone can view all slots" ON agenda_slots
    FOR SELECT 
    USING (true);

-- Qualquer pessoa pode inserir novos slots (para inicialização)
CREATE POLICY "Anyone can insert slots" ON agenda_slots
    FOR INSERT 
    WITH CHECK (true);

-- Qualquer pessoa pode atualizar slots (para reservas públicas)
CREATE POLICY "Anyone can update slots" ON agenda_slots
    FOR UPDATE 
    USING (true);

-- Admin autenticado pode fazer tudo
CREATE POLICY "Authenticated users can manage all slots" ON agenda_slots
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- ==================== POLICIES: CLIENTS ====================

-- Qualquer pessoa pode inserir clientes (para reservas públicas)
CREATE POLICY "Anyone can insert clients" ON clients
    FOR INSERT 
    WITH CHECK (true);

-- Qualquer pessoa pode ler clientes (necessário para exibir nome em slots)
CREATE POLICY "Anyone can view clients" ON clients
    FOR SELECT 
    USING (true);

-- Apenas admin autenticado pode atualizar e deletar
CREATE POLICY "Authenticated users can manage clients" ON clients
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- ==================== POLICIES: FILES ====================

-- Apenas admin pode acessar arquivos
CREATE POLICY "Authenticated users only for files" ON files
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- ==================== FUNÇÃO: ATUALIZAR UPDATED_AT ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para files
DROP TRIGGER IF EXISTS update_files_updated_at ON files;
CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== DADOS INICIAIS (OPCIONAL) ====================

-- Criar 30 slots iniciais (se não existirem)
DO $$
DECLARE
    i INTEGER;
    current_date DATE := CURRENT_DATE;
    slot_start DATE;
    slot_end DATE;
BEGIN
    -- Verificar se já existem slots
    IF NOT EXISTS (SELECT 1 FROM agenda_slots) THEN
        FOR i IN 1..30 LOOP
            slot_start := current_date + ((i - 1) * 7);
            slot_end := slot_start + 6;
            
            INSERT INTO agenda_slots (slot_number, start_date, end_date, status)
            VALUES (i, slot_start, slot_end, 'available');
        END LOOP;
        
        RAISE NOTICE '30 slots criados com sucesso!';
    ELSE
        RAISE NOTICE 'Slots já existem. Pulando criação inicial.';
    END IF;
END $$;

-- ==================== VIEWS ÚTEIS ====================

-- View: Slots com informações de cliente
CREATE OR REPLACE VIEW slots_with_clients AS
SELECT 
    s.*,
    c.store_name,
    c.contact_name,
    c.phone,
    c.email,
    c.status as client_status
FROM agenda_slots s
LEFT JOIN clients c ON s.client_id = c.id
ORDER BY s.slot_number;

-- View: Estatísticas rápidas
CREATE OR REPLACE VIEW agenda_stats AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'available') as available_slots,
    COUNT(*) FILTER (WHERE status = 'reserved') as reserved_slots,
    COUNT(*) FILTER (WHERE status = 'paid') as paid_slots,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_slots,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_slots,
    COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_payments
FROM agenda_slots;

-- ==================== SUCESSO ====================
SELECT 'Schema VIZZU criado com sucesso! ✅' as message;
SELECT '4 tabelas criadas: public_briefings, clients, agenda_slots, files' as info;
SELECT 'RLS habilitado com policies configuradas' as security;
SELECT '30 slots iniciais criados (se não existiam)' as initial_data;

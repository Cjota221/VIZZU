# 🗄️ Configuração do Supabase - VIZZU

## ✅ Credenciais Configuradas

```
URL: https://qnozgkocxxzrczyczaio.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (configurada)
Status: ✅ ATIVO
```

## 📋 Passo a Passo

### 1️⃣ Acessar o Supabase
```
https://supabase.com/dashboard/project/qnozgkocxxzrczyczaio
```

### 2️⃣ Executar o Schema SQL
1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie TODO o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor
5. Clique em **RUN** (canto inferior direito)

### 3️⃣ Verificar Criação
Você deve ver:
```
✅ 4 tabelas criadas (public_briefings, clients, agenda_slots, files)
✅ RLS habilitado
✅ Policies configuradas
✅ 30 slots iniciais criados
```

### 4️⃣ Testar Conexão
1. Abra `index.html` no navegador
2. Abra o Console (F12)
3. Você deve ver no console:
   ```
   Supabase conectado!
   ```
4. Se houver erro, verifique:
   - URL e Anon Key em `js/supabase.js`
   - Tabelas criadas no Supabase
   - RLS habilitado

## 🔍 Verificar Dados

### No Supabase Dashboard

#### Table Editor
```
Database → Tables → agenda_slots
```
Você deve ver 30 slots com status 'available'

#### SQL Query
```sql
SELECT * FROM agenda_slots ORDER BY slot_number;
SELECT * FROM agenda_stats;
```

## 🔐 Políticas de Segurança (RLS)

### ✅ Configuradas Automaticamente

**public_briefings**
- ✅ Qualquer pessoa pode INSERIR (público)
- ✅ Qualquer pessoa pode LER próprio briefing
- ✅ Admin autenticado pode ver TODOS

**agenda_slots**
- ✅ Qualquer pessoa pode ver slots DISPONÍVEIS
- ✅ Admin pode gerenciar TODOS

**clients e files**
- ✅ Apenas ADMIN autenticado

## 🧪 Testes Recomendados

### 1. Criar Briefing Público
```
1. Gere link de briefing no Dashboard
2. Abra em aba anônima
3. Preencha formulário
4. Verifique no Supabase: Table Editor → public_briefings
```

### 2. Reservar Vaga
```
1. Gere link de agenda pública
2. Escolha slot disponível
3. Preencha dados
4. Verifique: agenda_slots (status='reserved') + clients (novo)
```

### 3. Confirmar Pagamento
```
1. Vá em Clientes
2. Clique "💰 Pagar" em cliente pendente
3. Verifique: agenda_slots (payment_status='confirmed')
```

## 📊 Monitoramento

### Logs em Tempo Real
```
Supabase Dashboard → Logs → Database
```

### Estatísticas
```sql
SELECT * FROM agenda_stats;
```

### Slots Ocupados
```sql
SELECT * FROM slots_with_clients WHERE status != 'available';
```

## ⚠️ Problemas Comuns

### Erro: "relation does not exist"
**Solução**: Execute `supabase-schema.sql` novamente

### Erro: "RLS policy violation"
**Solução**: Verifique se RLS está habilitado e policies criadas
```sql
ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;
```

### Dados não aparecem
**Solução**: 
1. Verifique console do navegador (F12)
2. Confirme `USE_SUPABASE = true` em `js/supabase.js`
3. Teste conexão:
   ```javascript
   console.log(supabase); // Deve retornar objeto
   ```

## 🚀 Migração de localStorage

Se você já tem dados no localStorage:

### 1. Exportar
```javascript
// No console do navegador
const slots = JSON.parse(localStorage.getItem('agenda_slots'));
console.log(JSON.stringify(slots));
```

### 2. Importar no Supabase
```sql
-- Copie JSON e importe via Table Editor
INSERT INTO agenda_slots (...)
SELECT * FROM json_populate_recordset(...);
```

## 🔧 Manutenção

### Limpar Slots Antigos
```sql
DELETE FROM agenda_slots 
WHERE end_date < CURRENT_DATE - INTERVAL '30 days';
```

### Criar Novos Slots
```sql
-- Adicionar 10 slots a partir do último
INSERT INTO agenda_slots (slot_number, start_date, end_date, status)
SELECT 
    (SELECT MAX(slot_number) FROM agenda_slots) + ROW_NUMBER() OVER (),
    CURRENT_DATE + ((ROW_NUMBER() OVER () - 1) * 7),
    CURRENT_DATE + ((ROW_NUMBER() OVER () - 1) * 7) + 6,
    'available'
FROM generate_series(1, 10);
```

## 📞 Suporte

- **Docs Supabase**: https://supabase.com/docs
- **RLS Docs**: https://supabase.com/docs/guides/auth/row-level-security
- **SQL Editor**: https://supabase.com/docs/guides/database/overview

---

**Status**: ✅ Configurado e Pronto para Produção
**Última atualização**: 1 de dezembro de 2025

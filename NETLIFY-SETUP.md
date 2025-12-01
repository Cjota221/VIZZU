# 🚀 CONFIGURAÇÃO NETLIFY + VARIÁVEIS DE AMBIENTE

## 📋 **Passo a Passo Completo**

### **1️⃣ Deploy Inicial no Netlify**

#### **Opção A: Via GitHub (Recomendado)**
```
1. Acesse: https://app.netlify.com/
2. Clique em: "Add new site" → "Import an existing project"
3. Escolha: "Deploy with GitHub"
4. Selecione o repositório: Cjota221/VIZZU
5. Configure:
   - Branch: main
   - Build command: (deixe vazio)
   - Publish directory: .
6. Clique em: "Deploy site"
```

#### **Opção B: Drag & Drop Manual**
```
1. Acesse: https://app.netlify.com/drop
2. Arraste a pasta: C:\Users\Public\vizzu-agendamento
3. Aguarde o upload e deploy
```

---

### **2️⃣ Configurar Variáveis de Ambiente**

#### **No Netlify Dashboard:**

```
1. Acesse seu site no Netlify
2. Vá em: Site settings → Environment variables
3. Clique em: "Add a variable"
```

#### **Adicione 2 Variáveis:**

**Variável 1:**
```
Key:   SUPABASE_URL
Value: https://qnozgkocxxzrczyczaio.supabase.co
```

**Variável 2:**
```
Key:   SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFub3pna29jeHh6cmN6eWN6YWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwODQzNjQsImV4cCI6MjA0ODY2MDM2NH0.cZUVJ7qeN-3p9LrY8vZ5xHGqJ_6wK8FZdVxN0FJTxQo
```

**Importante:** Clique em "Save" após adicionar cada variável.

---

### **3️⃣ Atualizar o Código para Usar Variáveis de Ambiente**

❌ **PROBLEMA:** Variáveis de ambiente não funcionam diretamente no frontend (HTML/JS puro).

✅ **SOLUÇÃO ATUAL:** Manter as credenciais no código (é seguro para chave ANON pública).

**Por quê é seguro?**
- ✅ A chave `anon` do Supabase é **pública por design**
- ✅ Ela já tem proteções RLS (Row Level Security)
- ✅ Não dá acesso a operações admin
- ✅ É como uma "API key" de leitura/escrita básica

---

### **4️⃣ Configuração Atual (Já está correta)**

No arquivo `js/supabase.js`:

```javascript
// Estas credenciais podem ficar no código
const SUPABASE_URL = 'https://qnozgkocxxzrczyczaio.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Toggle para desenvolvimento vs produção
const USE_SUPABASE = false; // Local: false | Produção: true
```

---

### **5️⃣ Workflow Completo**

#### **Desenvolvimento Local (Agora):**
```javascript
USE_SUPABASE = false  // Usa LocalStorage
```
- ✅ Funciona offline
- ✅ Dados salvos no navegador
- ✅ Ideal para testes

#### **Produção no Netlify (Depois):**
```javascript
USE_SUPABASE = true  // Usa Supabase
```
- ✅ Dados reais no banco
- ✅ Sincronização entre dispositivos
- ✅ Backup automático

---

### **6️⃣ Quando Estiver Pronto para Produção**

#### **Checklist:**
```
[ ] 1. Executar supabase-schema.sql no Supabase
[ ] 2. Testar conexão localmente (USE_SUPABASE = true)
[ ] 3. Commit e push para GitHub
[ ] 4. Netlify faz redeploy automático
[ ] 5. Testar site em produção
```

#### **Comandos:**
```powershell
# 1. Ativar Supabase no código
# Editar js/supabase.js: USE_SUPABASE = true

# 2. Commit
git add .
git commit -m "feat: Ativar Supabase em produção"
git push origin main

# 3. Netlify redeploy automático (2-3 minutos)
```

---

### **7️⃣ Verificar Deploy**

Após o deploy:

1. **Acesse o URL do Netlify** (ex: vizzu-xxxxx.netlify.app)
2. **Abra o Console** (F12)
3. **Verifique erros**:
   ```javascript
   // Deve aparecer no console:
   ✅ "Agenda inicializada com 30 slots"
   
   // Não deve aparecer:
   ❌ Erro 401
   ❌ Failed to load resource
   ```

---

### **8️⃣ Domínio Customizado (Opcional)**

Se quiser usar um domínio próprio:

```
1. Netlify Dashboard → Domain settings
2. Add custom domain
3. Configure DNS (CNAME para netlify.app)
4. SSL/HTTPS automático (Let's Encrypt)
```

---

## 🔐 **Segurança: Chave Anon vs Service Key**

### **✅ Pode Ficar Pública (Anon Key):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- Usada no frontend
- Protegida por RLS
- Só permite operações definidas nas policies

### **❌ NUNCA Expor (Service Key):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...role:service_role...
```
- Acesso admin total
- Bypass RLS
- Só usar no backend

---

## 📊 **Status Atual do Projeto**

```
✅ Código no GitHub: https://github.com/Cjota221/VIZZU
✅ LocalStorage funcionando
✅ Pronto para deploy Netlify
⏳ Aguardando: Execute SQL + USE_SUPABASE = true
```

---

## 🎯 **Próximos Passos Recomendados**

1. **Deploy no Netlify** (pode fazer agora mesmo!)
2. **Testar o site online** (ainda com LocalStorage)
3. **Executar SQL no Supabase** (quando quiser dados reais)
4. **Ativar USE_SUPABASE = true**
5. **Commit e redeploy**

---

## 💡 **Dicas Úteis**

### **Ver Logs do Deploy:**
```
Netlify Dashboard → Deploys → (último deploy) → Deploy log
```

### **Preview de Deploy:**
```
Cada commit gera um preview URL único
Teste antes de ir para produção
```

### **Rollback Rápido:**
```
Netlify Dashboard → Deploys → (versão anterior) → Publish deploy
```

---

**Quer que eu faça o deploy agora ou prefere revisar algo antes?** 🚀

# 🚀 Guia Completo de Deploy - VIZZU

## 📋 Pré-requisitos

- ✅ Conta GitHub (gratuita)
- ✅ Conta Netlify (gratuita)
- ✅ Git instalado no Windows

## 🔧 PASSO 1: Preparar Repositório Git

### 1.1 Abrir PowerShell na pasta do projeto
```powershell
cd C:\Users\Public\vizzu-agendamento
```

### 1.2 Inicializar Git
```powershell
git init
git add .
git commit -m "🎉 Initial commit - VIZZU Agendamento System"
```

### 1.3 Verificar arquivos
```powershell
git status
```
✅ Deve mostrar: "nothing to commit, working tree clean"

---

## 🌐 PASSO 2: Publicar no GitHub

### 2.1 Criar Repositório no GitHub
1. Acesse: https://github.com/new
2. **Repository name**: `vizzu-agendamento`
3. **Description**: `Sistema de agendamento e gestão de projetos com slots sequenciais de 7 dias`
4. **Visibility**: 
   - ✅ **Public** (recomendado para Netlify grátis)
   - ⚠️ Private (funciona, mas pode ter limitações)
5. **NÃO** marque "Initialize with README" (já temos)
6. Clique **Create repository**

### 2.2 Conectar e Fazer Push
Copie e execute os comandos que o GitHub mostrar (algo como):

```powershell
git remote add origin https://github.com/SEU-USUARIO/vizzu-agendamento.git
git branch -M main
git push -u origin main
```

**Substitua** `SEU-USUARIO` pelo seu username do GitHub!

### 2.3 Verificar
Acesse: `https://github.com/SEU-USUARIO/vizzu-agendamento`

✅ Você deve ver todos os arquivos online!

---

## 🎯 PASSO 3: Deploy no Netlify

### OPÇÃO A: Deploy via GitHub (Recomendado)

#### 3.1 Conectar Netlify ao GitHub
1. Acesse: https://app.netlify.com/start
2. Clique **Add new site** → **Import an existing project**
3. Escolha **Deploy with GitHub**
4. Autorize o Netlify a acessar sua conta GitHub
5. Selecione o repositório `vizzu-agendamento`

#### 3.2 Configurar Build Settings
```
Build command:     (deixe vazio)
Publish directory: .
```

#### 3.3 Configurar Environment Variables
**IMPORTANTE**: Antes de fazer deploy, adicione as variáveis:

1. Vá em **Site settings** → **Environment variables**
2. Clique **Add a variable**
3. Adicione:

```
SUPABASE_URL = https://qnozgkocxxzrczyczaio.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFub3pna29jeHh6cmN6eWN6YWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwODQzNjQsImV4cCI6MjA0ODY2MDM2NH0.cZUVJ7qe
```

⚠️ **IMPORTANTE**: Como as credenciais já estão no código (`js/supabase.js`), as env vars são opcionais neste caso. Mas é boa prática para segurança futura.

#### 3.4 Deploy!
1. Clique **Deploy site**
2. Aguarde ~1-2 minutos
3. ✅ Pronto! Você terá uma URL tipo: `https://random-name-123.netlify.app`

---

### OPÇÃO B: Deploy Direto (Drag & Drop)

Mais rápido, mas sem CI/CD automático:

1. Acesse: https://app.netlify.com/drop
2. **Arraste a pasta** `C:\Users\Public\vizzu-agendamento` para o navegador
3. Aguarde upload
4. ✅ Site publicado!

---

## 🎨 PASSO 4: Personalizar Domínio (Opcional)

### 4.1 Mudar Nome do Site
1. No Netlify, vá em **Site settings** → **Site information**
2. Clique **Change site name**
3. Digite: `vizzu-agendamento` (se disponível)
4. Agora seu site será: `https://vizzu-agendamento.netlify.app`

### 4.2 Domínio Customizado (se tiver)
1. **Site settings** → **Domain management**
2. Clique **Add custom domain**
3. Digite seu domínio (ex: `vizzu.com.br`)
4. Siga instruções para configurar DNS

---

## ✅ PASSO 5: Verificar Deploy

### 5.1 Testar URLs
Acesse cada página:
```
https://seu-site.netlify.app/
https://seu-site.netlify.app/briefing.html
https://seu-site.netlify.app/agenda-publica.html
https://seu-site.netlify.app/clientes.html
https://seu-site.netlify.app/arquivos.html
```

### 5.2 Testar Supabase
1. Abra Console (F12)
2. Vá no Dashboard
3. Deve conectar ao Supabase sem erros

### 5.3 Testar Fluxo Completo
```
1. Gerar link de briefing → Preencher → Verificar no Supabase
2. Gerar link de agenda → Reservar vaga → Confirmar no dashboard
3. Ir em Clientes → Confirmar pagamento
4. Ir em Arquivos → Editar código
```

---

## 🔄 PASSO 6: Atualizações Futuras

### 6.1 Fazer Mudanças Locais
Edite os arquivos normalmente no VS Code

### 6.2 Commitar e Fazer Push
```powershell
cd C:\Users\Public\vizzu-agendamento
git add .
git commit -m "feat: descrição da mudança"
git push
```

### 6.3 Deploy Automático
Se usou **Opção A** (GitHub), o Netlify detecta automaticamente e faz novo deploy!

Se usou **Opção B** (Drag & Drop):
- Vá em **Deploys** → **Drag and drop** novamente

---

## 📊 Monitoramento no Netlify

### Analytics (grátis)
**Site settings** → **Analytics**
- Visitantes únicos
- Page views
- Fontes de tráfego

### Logs
**Deploys** → Clique em qualquer deploy → **Deploy log**

### Forms (se adicionar)
**Site settings** → **Forms**

---

## 🔒 Segurança

### Headers Configurados (via netlify.toml)
✅ X-Frame-Options
✅ X-Content-Type-Options
✅ X-XSS-Protection
✅ Referrer-Policy

### HTTPS
✅ Automático no Netlify (Let's Encrypt)

### Supabase RLS
✅ Já configurado no schema SQL

---

## 🎯 URLs Importantes

### Após Deploy:
```
🌐 Site Principal:    https://vizzu-agendamento.netlify.app
📊 Dashboard Netlify: https://app.netlify.com/sites/vizzu-agendamento
🗄️ Supabase:          https://supabase.com/dashboard/project/qnozgkocxxzrczyczaio
📦 GitHub:            https://github.com/SEU-USUARIO/vizzu-agendamento
```

---

## 🐛 Troubleshooting

### Deploy falha
**Erro**: "Build failed"
**Solução**: 
```
- Verifique se Build command está VAZIO
- Verifique se Publish directory é "."
```

### Página 404
**Erro**: Página não encontrada
**Solução**:
```
- Verifique se netlify.toml está commitado
- Verifique redirects: from = "/*" to = "/index.html"
```

### Supabase não conecta
**Erro**: "Failed to connect"
**Solução**:
```
1. Verifique console (F12) para erro específico
2. Confirme que executou supabase-schema.sql
3. Verifique URL e Anon Key em js/supabase.js
4. Teste connection direto no Supabase Dashboard
```

### CSS/JS não carrega
**Erro**: Estilos não aplicam
**Solução**:
```
- Limpe cache do navegador (Ctrl+Shift+R)
- Verifique Network tab (F12) para erros 404
- Confirme que caminhos relativos estão corretos (href="css/vizzu.css")
```

---

## 📱 Compartilhar Links Públicos

Após deploy, gere links assim:

### Briefing:
```
https://vizzu-agendamento.netlify.app/briefing.html?token=vizzu_abc123xyz
```

### Agenda:
```
https://vizzu-agendamento.netlify.app/agenda-publica.html?token=vizzu_xyz789
```

Envie por WhatsApp, email, etc!

---

## 🎉 Checklist Final

- [ ] Git inicializado e commitado
- [ ] Repositório criado no GitHub
- [ ] Push feito com sucesso
- [ ] Site deployado no Netlify
- [ ] Schema SQL executado no Supabase
- [ ] Todas as páginas carregando (5)
- [ ] Supabase conectando sem erros
- [ ] Teste de reserva de vaga funcionando
- [ ] Teste de briefing funcionando
- [ ] Links públicos funcionando

---

**🚀 Parabéns! Seu sistema está NO AR!**

Agora você pode compartilhar:
- Dashboard admin: `https://vizzu-agendamento.netlify.app`
- Links públicos com clientes

**Próximos passos**: Marketing, clientes, $$$! 💰

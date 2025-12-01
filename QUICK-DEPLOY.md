# 🚀 COMANDOS RÁPIDOS - PUBLISH

## ✅ Git já inicializado!
```
✓ 16 arquivos commitados
✓ Pronto para fazer push
```

---

## 📋 PRÓXIMOS PASSOS (COPIE E COLE):

### 1️⃣ Criar Repositório no GitHub
👉 Acesse: https://github.com/new

- **Nome**: `vizzu-agendamento`
- **Visibilidade**: Public
- **NÃO** marque "Initialize with README"
- Clique **Create repository**

---

### 2️⃣ Conectar ao GitHub (COPIE ESTES COMANDOS)

⚠️ **IMPORTANTE**: Substitua `SEU-USUARIO` pelo seu username do GitHub!

```powershell
cd C:\Users\Public\vizzu-agendamento
git remote add origin https://github.com/SEU-USUARIO/vizzu-agendamento.git
git branch -M main
git push -u origin main
```

**Exemplo**:
Se seu username for `joaosilva`, use:
```powershell
git remote add origin https://github.com/joaosilva/vizzu-agendamento.git
```

---

### 3️⃣ Deploy no Netlify

#### OPÇÃO A - Automático (Recomendado):
1. 👉 https://app.netlify.com/start
2. Clique **Import from Git** → **GitHub**
3. Autorize e selecione `vizzu-agendamento`
4. **Build settings**:
   - Build command: (vazio)
   - Publish directory: `.`
5. Clique **Deploy site**

#### OPÇÃO B - Manual (Mais Rápido):
1. 👉 https://app.netlify.com/drop
2. Arraste a pasta `C:\Users\Public\vizzu-agendamento`
3. Aguarde upload
4. ✅ Pronto!

---

### 4️⃣ Configurar Supabase (OBRIGATÓRIO)

1. 👉 https://supabase.com/dashboard/project/qnozgkocxxzrczyczaio
2. Clique **SQL Editor** (menu lateral)
3. Clique **New Query**
4. Abra o arquivo `supabase-schema.sql` no VS Code
5. **COPIE TODO O CONTEÚDO** (Ctrl+A, Ctrl+C)
6. **COLE** no SQL Editor do Supabase (Ctrl+V)
7. Clique **RUN** ▶️ (canto inferior direito)
8. ✅ Aguarde mensagem de sucesso

---

### 5️⃣ Testar Tudo

Após deploy no Netlify, acesse:

```
https://SEU-SITE.netlify.app
```

**Teste**:
- ✅ Dashboard carrega
- ✅ Console (F12) não tem erros
- ✅ Supabase conecta (veja console)
- ✅ Clique "Gerar Links" funciona
- ✅ Abra link de briefing em aba anônima
- ✅ Preencha e envie briefing
- ✅ Verifique no Supabase: Table Editor → `public_briefings`

---

## 🔄 Para Fazer Mudanças Depois

```powershell
# 1. Edite arquivos no VS Code

# 2. Commite e faça push:
cd C:\Users\Public\vizzu-agendamento
git add .
git commit -m "feat: descrição da mudança"
git push

# 3. Netlify faz deploy automático (se conectou via GitHub)
```

---

## 📱 Gerar Links para Clientes

No Dashboard do site publicado:
1. Clique "🔗 Gerar Links"
2. Escolha **Briefing** ou **Agenda**
3. Link copiado!
4. Envie por WhatsApp/Email

**Exemplo de links**:
```
https://vizzu-agendamento.netlify.app/briefing.html?token=vizzu_abc123
https://vizzu-agendamento.netlify.app/agenda-publica.html?token=vizzu_xyz789
```

---

## ⚡ RESUMO - 5 MINUTOS:

```
✅ 1. Criar repo no GitHub (2 min)
✅ 2. git push (30 seg)
✅ 3. Deploy Netlify (2 min)
✅ 4. Executar SQL no Supabase (30 seg)
✅ 5. Testar site (1 min)
```

**TOTAL**: ~6 minutos para publicar tudo! 🚀

---

## 🆘 Problemas?

### "fatal: remote origin already exists"
```powershell
git remote remove origin
# Depois execute o comando remote add novamente
```

### "Username for GitHub"
- Use seu email do GitHub
- Senha: use **Personal Access Token** (não senha normal)
- Criar token: https://github.com/settings/tokens

### "Permission denied"
Configure SSH ou use HTTPS com token

---

## 📞 Links Úteis

- **Seu GitHub**: https://github.com/SEU-USUARIO
- **Netlify Dashboard**: https://app.netlify.com
- **Supabase Dashboard**: https://supabase.com/dashboard/project/qnozgkocxxzrczyczaio
- **Documentação completa**: Veja `DEPLOY-GUIDE.md`

---

**🎉 PRONTO PARA PUBLICAR!**

Siga os 5 passos acima e em 6 minutos seu sistema estará no ar! 🚀

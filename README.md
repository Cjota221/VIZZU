# 🚀 VIZZU - Sistema de Agendamento e Gestão de Projetos

Sistema modular de agendamento com slots sequenciais de 7 dias, briefing completo de 30 perguntas e gerenciamento de clientes para agências de desenvolvimento web.

## 📁 Estrutura do Projeto

```
vizzu-agendamento/
├── index.html              # Dashboard Admin (stats + próximos 7 dias)
├── briefing.html           # Formulário Público (30 perguntas em 6 blocos)
├── agenda-publica.html     # Agenda Pública (clientes reservam vagas)
├── clientes.html           # Lista e Gestão de Clientes
├── arquivos.html           # Editor de Arquivos por Cliente
├── css/
│   └── vizzu.css          # Identidade Visual (Neon/Glass/Dark)
├── js/
│   ├── supabase.js        # Cliente Supabase + localStorage fallback
│   ├── agenda.js          # Lógica de slots sequenciais (7 dias cada)
│   ├── briefing.js        # 30 perguntas + validação
│   └── ui.js              # Navegação + Toasts + Modais
├── netlify.toml           # Config de deploy
└── README.md              # Este arquivo
```

## 🎨 Design System

### Cores Principais
- **Roxo VIZZU**: `#4a148c`
- **Pink Neon**: `#d500f9`
- **Green Neon**: `#c6ff00`
- **Dark BG**: `#1a0b2e`

### Componentes
- **Glassmorphism**: Efeito vidro com `backdrop-filter: blur(20px)`
- **Neon Glow**: Sombras coloridas em hover/focus
- **Responsive**: Mobile-first (breakpoints: 768px, 480px)
- **Acessibilidade**: WCAG AA, focus-visible, labels semânticos

## 🛠️ Instalação Local

### 1. Clonar/Baixar
```bash
git clone seu-repositorio.git
cd vizzu-agendamento
```

### 2. Abrir no Navegador
```bash
# Windows
start index.html

# Mac/Linux
open index.html
```

### 3. Testar Funcionalidades
- **Dashboard**: Visualizar stats e calendário 7 dias
- **Gerar Links**: Clicar em "🔗 Gerar Links" no header
- **Briefing Público**: Abrir link gerado, preencher 30 perguntas
- **Agenda Pública**: Reservar vaga disponível
- **Clientes**: Ver lista, confirmar pagamentos
- **Arquivos**: Editar HTML/CSS, preview live, paleta de cores

## 🗄️ Supabase (Produção)

### Tabelas Necessárias

```sql
-- 1. Briefings Públicos
CREATE TABLE public_briefings (
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

-- 2. Slots de Agenda
CREATE TABLE agenda_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_number INTEGER UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'available',
    payment_status TEXT,
    client_id BIGINT REFERENCES clients(id),
    reserved_at TIMESTAMPTZ,
    payment_confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Clientes
CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    store_name TEXT,
    contact_name TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'pending_payment',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Arquivos
CREATE TABLE files (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'html', 'css', 'palette', 'notes'
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policies RLS
ALTER TABLE public_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Briefings: INSERT público, SELECT admin
CREATE POLICY "Anyone can insert briefings" ON public_briefings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view briefings" ON public_briefings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Slots: SELECT disponíveis público, resto admin
CREATE POLICY "Anyone can view available slots" ON agenda_slots
    FOR SELECT USING (status = 'available' OR auth.role() = 'authenticated');

CREATE POLICY "Admin can manage slots" ON agenda_slots
    FOR ALL USING (auth.role() = 'authenticated');

-- Clientes e Arquivos: Admin apenas
CREATE POLICY "Admin only clients" ON clients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin only files" ON files
    FOR ALL USING (auth.role() = 'authenticated');
```

### Configuração

1. Criar projeto no [Supabase](https://supabase.com)
2. Executar SQL acima no SQL Editor
3. Copiar URL e Anon Key
4. Editar `js/supabase.js`:

```javascript
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA-CHAVE-ANONIMA';
const USE_SUPABASE = true; // Mudar para true
```

5. Adicionar CDN do Supabase no HTML (antes dos scripts):

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

## 🌐 Deploy Netlify

### Método 1: Arrastar & Soltar
1. Acesse [Netlify](https://www.netlify.com/)
2. Arraste a pasta `vizzu-agendamento/` para o dashboard
3. Configure variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### Método 2: GitHub
1. Push para GitHub
2. Conectar repositório no Netlify
3. Build settings:
   - **Build command**: (vazio)
   - **Publish directory**: `.`
4. Deploy!

### URL Final
```
https://vizzu-agendamento.netlify.app
```

## 📋 Fluxo de Trabalho

### Cliente (Público)
1. **Recebe link de briefing** → Preenche 30 perguntas → Submete
2. **Recebe link de agenda** → Escolhe vaga → Reserva → Recebe WhatsApp
3. **Paga via link** → Admin confirma → Projeto inicia

### Admin
1. **Dashboard** → Visualiza ocupação e stats
2. **Gera links** → Compartilha com clientes
3. **Clientes** → Confirma pagamentos, vê lista
4. **Arquivos** → Edita HTML/CSS, define paleta, preview live
5. **Finaliza** → Download ZIP → Marca concluído

## 🔧 Personalização

### Cores
Editar `css/vizzu.css` (linhas 11-20):
```css
:root {
    --roxo-vizzu: #4a148c;
    --pink-neon: #d500f9;
    --green-neon: #c6ff00;
}
```

### Perguntas do Briefing
Editar `js/briefing.js` (linha 9):
```javascript
const BRIEFING_QUESTIONS = [
    // Adicionar/remover blocos e perguntas
];
```

### Valor do Projeto
Editar `js/agenda.js` (linha 142):
```javascript
const pricePerSlot = 2500; // R$ 2.500
```

## 🐛 Troubleshooting

### Erro: "Token não encontrado"
- Certifique-se de acessar com `?token=XYZ` na URL
- Gere novo link pelo Dashboard

### Dados não salvam
- Verifique console do navegador (F12)
- Se usar Supabase, confirme `USE_SUPABASE = true` e credenciais corretas
- LocalStorage tem limite de ~5MB

### Preview não atualiza
- Clique em "🔄 Atualizar Preview" após editar código
- Verifique se não há erros de sintaxe no HTML/CSS

## 📱 WhatsApp Integration

Mensagens automáticas são enviadas em:
- **Reserva de vaga**: Link de pagamento
- **Pagamento confirmado**: Confirmação de início
- **Projeto concluído**: Entrega final

Formato: `https://wa.me/5511999999999?text=Mensagem`

## 📊 Métricas

### Performance
- **First Paint**: < 1s
- **Interativo**: < 2s
- **Tamanho total**: ~50KB (sem imagens)

### SEO
- Semântico (HTML5)
- Meta tags completas
- Mobile-friendly

## 🔐 Segurança

- **RLS no Supabase**: Clientes só veem dados públicos
- **Validação client-side**: Todos os forms
- **Sanitização**: Necessária no backend (adicionar)
- **HTTPS**: Obrigatório em produção

## 📞 Suporte

- **Email**: contato@vizzu.com
- **Docs Supabase**: https://supabase.com/docs
- **Netlify Docs**: https://docs.netlify.com

---

**Desenvolvido com 💜 por VIZZU**
Versão 1.0.0 | Última atualização: Dezembro 2025

/* ========================================
   VIZZU - LÓGICA DE BRIEFING
   30 perguntas + validação + submit
   ======================================== */

// ==================== CONFIGURAÇÃO DAS 30 PERGUNTAS ====================
const BRIEFING_QUESTIONS = [
    // BLOCO 1: IDENTIFICAÇÃO (5 perguntas)
    {
        block: 1,
        blockTitle: '1. Identificação',
        questions: [
            { id: 'storeName', label: 'Nome da sua loja atacadista', type: 'text', required: true },
            { id: 'contactName', label: 'Seu nome completo', type: 'text', required: true },
            { id: 'phone', label: 'WhatsApp (com DDD)', type: 'tel', required: true, placeholder: '(11) 99999-9999' },
            { id: 'email', label: 'E-mail profissional', type: 'email', required: true },
            { id: 'cnpj', label: 'CNPJ (opcional)', type: 'text', required: false }
        ]
    },
    
    // BLOCO 2: OBJETIVO E CONVERSÃO (5 perguntas)
    {
        block: 2,
        blockTitle: '2. Objetivo e Conversão',
        questions: [
            { id: 'mainGoal', label: 'Qual o principal objetivo do site?', type: 'select', required: true,
              options: ['Gerar pedidos de atacado', 'Captar leads B2B', 'Catálogo online', 'Vendas diretas', 'Outro'] },
            { id: 'targetAudience', label: 'Quem é seu cliente ideal? (Ex: mercados, bares, restaurantes)', type: 'textarea', required: true },
            { id: 'currentSales', label: 'Como você vende hoje?', type: 'select', required: true,
              options: ['Telefone/WhatsApp', 'Representantes', 'Loja física', 'Não tenho processo', 'Outro'] },
            { id: 'conversionAction', label: 'O que você quer que o visitante faça?', type: 'select', required: true,
              options: ['Preencher formulário de pedido', 'Enviar WhatsApp', 'Ligar', 'Baixar catálogo PDF', 'Cadastrar-se'] },
            { id: 'monthlyLeadsGoal', label: 'Quantos pedidos/leads você quer por mês?', type: 'number', required: true }
        ]
    },
    
    // BLOCO 3: PRODUTOS E CATÁLOGO (5 perguntas)
    {
        block: 3,
        blockTitle: '3. Produtos e Catálogo',
        questions: [
            { id: 'productCategories', label: 'Quais categorias de produtos você vende? (Ex: bebidas, alimentos, limpeza)', type: 'textarea', required: true },
            { id: 'totalProducts', label: 'Quantos produtos você tem no catálogo?', type: 'select', required: true,
              options: ['Até 50', '51-200', '201-500', '501-1000', 'Mais de 1000'] },
            { id: 'productImages', label: 'Você tem fotos profissionais dos produtos?', type: 'select', required: true,
              options: ['Sim, de todos', 'Sim, de alguns', 'Não, vou providenciar', 'Preciso de ajuda'] },
            { id: 'pricesOnSite', label: 'Quer mostrar preços no site?', type: 'select', required: true,
              options: ['Sim, público', 'Sim, só após login', 'Não, só por orçamento', 'Ainda não decidi'] },
            { id: 'minimumOrder', label: 'Tem pedido mínimo? Se sim, quanto?', type: 'text', required: false }
        ]
    },
    
    // BLOCO 4: DESIGN E REFERÊNCIAS (5 perguntas)
    {
        block: 4,
        blockTitle: '4. Design e Referências',
        questions: [
            { id: 'designStyle', label: 'Qual estilo de design você prefere?', type: 'select', required: true,
              options: ['Moderno e clean', 'Profissional corporativo', 'Colorido e vibrante', 'Minimalista', 'Luxuoso'] },
            { id: 'brandColors', label: 'Cores da sua marca (se tiver)', type: 'text', required: false, placeholder: 'Ex: azul, amarelo' },
            { id: 'hasLogo', label: 'Você tem logo?', type: 'select', required: true,
              options: ['Sim, tenho em alta qualidade', 'Sim, mas precisa melhorar', 'Não, preciso criar', 'Tenho só nome'] },
            { id: 'reference1', label: 'Site de referência 1 (que você GOSTA)', type: 'url', required: true, placeholder: 'https://exemplo.com' },
            { id: 'reference2', label: 'Site de referência 2 (que você GOSTA)', type: 'url', required: true, placeholder: 'https://exemplo.com' },
            { id: 'reference3', label: 'Site de referência 3 (que você GOSTA)', type: 'url', required: true, placeholder: 'https://exemplo.com' }
        ]
    },
    
    // BLOCO 5: FUNCIONALIDADES E CONVERSÃO (5 perguntas)
    {
        block: 5,
        blockTitle: '5. Funcionalidades',
        questions: [
            { id: 'needSearch', label: 'Precisa de busca de produtos?', type: 'select', required: true,
              options: ['Sim, essencial', 'Seria bom ter', 'Não é prioridade'] },
            { id: 'needFilters', label: 'Precisa de filtros (categoria, marca, preço)?', type: 'select', required: true,
              options: ['Sim, essencial', 'Seria bom ter', 'Não é prioridade'] },
            { id: 'needCart', label: 'Precisa de carrinho de compras?', type: 'select', required: true,
              options: ['Sim, com checkout completo', 'Sim, mas só para orçamento', 'Não, só formulário simples'] },
            { id: 'needLogin', label: 'Precisa de área de cliente/login?', type: 'select', required: true,
              options: ['Sim, com histórico de pedidos', 'Sim, simples', 'Não precisa'] },
            { id: 'whatsappPercent', label: 'Quantos % dos pedidos vêm por WhatsApp hoje?', type: 'range', required: true, min: 0, max: 100, step: 10 }
        ]
    },
    
    // BLOCO 6: PROCESSO E URGÊNCIA (5 perguntas)
    {
        block: 6,
        blockTitle: '6. Processo e Entrega',
        questions: [
            { id: 'hasContent', label: 'Você tem textos prontos para o site?', type: 'select', required: true,
              options: ['Sim, tudo pronto', 'Tenho alguns', 'Não, vocês criam?', 'Preciso de ajuda'] },
            { id: 'urgencyLevel', label: 'Qual o nível de urgência?', type: 'select', required: true,
              options: ['Preciso URGENTE (7 dias)', 'Tenho um pouco de pressa', 'Posso esperar', 'Sem pressa'] },
            { id: 'budget', label: 'Orçamento disponível', type: 'select', required: true,
              options: ['R$ 2.000-3.000', 'R$ 3.000-5.000', 'R$ 5.000-10.000', 'Acima de R$ 10.000', 'Ainda não defini'] },
            { id: 'paymentPreference', label: 'Preferência de pagamento', type: 'select', required: true,
              options: ['À vista (desconto)', 'Parcelado no cartão', 'PIX', 'Boleto', 'Preciso negociar'] },
            { id: 'additionalInfo', label: 'Alguma informação adicional importante?', type: 'textarea', required: false }
        ]
    }
];

// ==================== VALIDAÇÃO ====================
function validateBriefingForm(formData) {
    const errors = [];
    
    // Validar campos obrigatórios
    BRIEFING_QUESTIONS.forEach(block => {
        block.questions.forEach(q => {
            if (q.required && !formData[q.id]) {
                errors.push(`Campo "${q.label}" é obrigatório`);
            }
        });
    });
    
    // Validações específicas
    if (formData.phone && !validatePhone(formData.phone)) {
        errors.push('WhatsApp inválido');
    }
    
    if (formData.email && !validateEmail(formData.email)) {
        errors.push('E-mail inválido');
    }
    
    // Validar URLs de referência
    ['reference1', 'reference2', 'reference3'].forEach(ref => {
        if (formData[ref] && !validateUrl(formData[ref])) {
            errors.push(`${ref} não é uma URL válida`);
        }
    });
    
    return errors;
}

function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// ==================== SUBMETER BRIEFING ====================
async function submitBriefing(token, formData) {
    try {
        // Validar
        const errors = validateBriefingForm(formData);
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        // Salvar
        const briefing = await storage.createBriefing({
            token: token,
            respostas_json: JSON.stringify(formData),
            store_name: formData.storeName,
            contact_name: formData.contactName,
            phone: formData.phone,
            email: formData.email,
            status: 'pending_review'
        });
        
        return briefing;
    } catch (error) {
        console.error('Erro ao submeter briefing:', error);
        throw error;
    }
}

// ==================== CALCULAR PROGRESSO ====================
function calculateProgress(formData) {
    let answered = 0;
    let total = 0;
    
    BRIEFING_QUESTIONS.forEach(block => {
        block.questions.forEach(q => {
            total++;
            if (formData[q.id]) answered++;
        });
    });
    
    return Math.round((answered / total) * 100);
}

// ==================== OBTER PERGUNTAS POR BLOCO ====================
function getQuestionsByBlock(blockNumber) {
    const block = BRIEFING_QUESTIONS.find(b => b.block === blockNumber);
    return block ? block.questions : [];
}

// ==================== RENDERIZAR PREVIEW ====================
function renderBriefingPreview(formData) {
    let html = '<div class="briefing-preview">';
    
    BRIEFING_QUESTIONS.forEach(block => {
        html += `<div class="preview-block">`;
        html += `<h3>${block.blockTitle}</h3>`;
        
        block.questions.forEach(q => {
            const value = formData[q.id];
            if (value) {
                html += `
                    <div class="preview-item">
                        <strong>${q.label}:</strong>
                        <span>${value}</span>
                    </div>
                `;
            }
        });
        
        html += `</div>`;
    });
    
    html += '</div>';
    return html;
}

// ==================== MÁSCARA DE TELEFONE ====================
function phoneMask(value) {
    value = value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    return value;
}

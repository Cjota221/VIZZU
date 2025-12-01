/* ========================================
   VIZZU - UI HELPERS
   Navegação + Toasts + Animações
   ======================================== */

// ==================== NAVEGAÇÃO ====================
function renderHeader(activePage = '') {
    return `
        <header class="vizzu-header">
            <a href="index.html" class="vizzu-logo">VIZZU</a>
            <nav class="vizzu-nav">
                <a href="index.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
                    📊 Dashboard
                </a>
                <a href="clientes.html" class="nav-link ${activePage === 'clientes' ? 'active' : ''}">
                    👥 Clientes
                </a>
                <a href="#" class="nav-link" onclick="showLinkGenerator(); return false;">
                    🔗 Gerar Links
                </a>
            </nav>
        </header>
    `;
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success', duration = 3000) {
    // Remover toasts existentes
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.5rem;">${icon}</span>
            <span style="flex: 1;">${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==================== MODAL ====================
function showModal(content, title = '') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
    };
    
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// ==================== GERADOR DE LINKS ====================
function showLinkGenerator() {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="card">
                <h3 style="margin-bottom: 1rem;">🔗 Link de Agenda Pública</h3>
                <p style="color: rgba(255,255,255,0.7); margin-bottom: 1rem;">
                    Compartilhe este link para clientes verem vagas disponíveis e reservarem
                </p>
                <button class="btn btn-neon" onclick="generateAndCopyLink('agenda')" style="width: 100%;">
                    Gerar Link de Agenda
                </button>
            </div>
            
            <div class="card">
                <h3 style="margin-bottom: 1rem;">📋 Link de Briefing</h3>
                <p style="color: rgba(255,255,255,0.7); margin-bottom: 1rem;">
                    Link para cliente preencher briefing completo (30 perguntas)
                </p>
                <button class="btn btn-primary" onclick="generateAndCopyLink('briefing')" style="width: 100%;">
                    Gerar Link de Briefing
                </button>
            </div>
        </div>
    `;
    
    showModal(content, 'Gerador de Links Públicos');
}

async function generateAndCopyLink(type) {
    const link = generatePublicLink(type);
    
    try {
        await navigator.clipboard.writeText(link);
        showToast(`Link copiado! Compartilhe: ${link}`, 'success', 5000);
        closeModal();
    } catch (err) {
        // Fallback para navegadores sem clipboard API
        const tempInput = document.createElement('input');
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast(`Link copiado! ${link}`, 'success', 5000);
        closeModal();
    }
}

// ==================== LOADING SPINNER ====================
function showLoading(message = 'Carregando...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-overlay';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(13, 6, 24, 0.95);
        backdrop-filter: blur(10px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 1rem;
    `;
    
    loadingDiv.innerHTML = `
        <div style="
            width: 60px;
            height: 60px;
            border: 4px solid rgba(213, 0, 249, 0.2);
            border-top-color: #d500f9;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        "></div>
        <p style="color: #fff; font-size: 1.1rem;">${message}</p>
    `;
    
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) loading.remove();
}

// ==================== FORMATAÇÃO ====================
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}

// ==================== CONFIRMAÇÃO ====================
function confirm(message, callback) {
    const content = `
        <p style="font-size: 1.1rem; margin-bottom: 2rem; text-align: center;">
            ${message}
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button class="btn btn-outline" onclick="closeModal()">
                Cancelar
            </button>
            <button class="btn btn-neon" onclick="confirmAction()">
                Confirmar
            </button>
        </div>
    `;
    
    window.confirmCallback = callback;
    showModal(content, 'Confirmação');
}

function confirmAction() {
    if (window.confirmCallback) {
        window.confirmCallback();
        window.confirmCallback = null;
    }
    closeModal();
}

// ==================== QUERY PARAMS ====================
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// ==================== COPIAR TEXTO ====================
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copiado!', 'success', 1500);
    } catch (err) {
        const tempInput = document.createElement('input');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast('Copiado!', 'success', 1500);
    }
}

// ==================== ANIMAÇÕES CSS EXTRAS ====================
const extraStyles = `
    <style>
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .fade-in {
        animation: fadeInPage 0.3s ease;
    }
    
    .slide-up {
        animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    .pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
    </style>
`;

// Adicionar estilos extras ao carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        document.head.insertAdjacentHTML('beforeend', extraStyles);
    });
} else {
    document.head.insertAdjacentHTML('beforeend', extraStyles);
}

// ==================== STATUS BADGES ====================
function getStatusBadge(status) {
    const badges = {
        'available': '<span class="badge badge-success">✅ Disponível</span>',
        'reserved': '<span class="badge badge-warning">⏳ Reservado</span>',
        'paid': '<span class="badge badge-success">💰 Pago</span>',
        'in_progress': '<span class="badge badge-info">🚀 Em Andamento</span>',
        'completed': '<span class="badge badge-success">✅ Concluído</span>',
        'pending_payment': '<span class="badge badge-warning">⚠️ Aguardando Pagamento</span>',
        'pending_review': '<span class="badge badge-info">👀 Em Análise</span>'
    };
    
    return badges[status] || status;
}

// ==================== EMPTY STATE ====================
function renderEmptyState(icon, title, description, actionButton = '') {
    return `
        <div style="
            text-align: center;
            padding: 4rem 2rem;
            background: var(--glass);
            border-radius: 16px;
            border: 1px dashed var(--glass-border);
        ">
            <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">
                ${icon}
            </div>
            <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: rgba(255,255,255,0.9);">
                ${title}
            </h3>
            <p style="color: rgba(255,255,255,0.6); margin-bottom: 1.5rem;">
                ${description}
            </p>
            ${actionButton}
        </div>
    `;
}

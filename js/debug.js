/**
 * ===================================
 * VIZZU DEBUG SYSTEM
 * Sistema completo de logs e diagnóstico
 * ===================================
 */

// ==================== CONFIGURAÇÃO ====================
window.VIZZU_DEBUG = {
    enabled: true,
    showTimestamp: true,
    showStackTrace: false,
    logToConsole: true,
    logToScreen: true
};

// ==================== CATEGORIAS DE LOG ====================
const LOG_CATEGORIES = {
    CONFIG: { icon: '🔧', color: '#2196F3', label: 'Config' },
    SUCCESS: { icon: '✅', color: '#4CAF50', label: 'Sucesso' },
    ERROR: { icon: '❌', color: '#F44336', label: 'Erro' },
    WARNING: { icon: '⚠️', color: '#FF9800', label: 'Aviso' },
    DATA: { icon: '📊', color: '#9C27B0', label: 'Dados' },
    QUERY: { icon: '🔍', color: '#00BCD4', label: 'Query' },
    API: { icon: '🌐', color: '#FF5722', label: 'API' },
    STORAGE: { icon: '💾', color: '#607D8B', label: 'Storage' }
};

// ==================== CONTAINER DE LOGS NA TELA ====================
function createDebugPanel() {
    if (!window.VIZZU_DEBUG.logToScreen) return;
    if (document.getElementById('vizzu-debug-panel')) return;
    
    const panel = document.createElement('div');
    panel.id = 'vizzu-debug-panel';
    panel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        max-height: 300px;
        background: rgba(0, 0, 0, 0.95);
        border: 1px solid #d500f9;
        border-radius: 8px;
        padding: 10px;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        color: white;
        overflow-y: auto;
        z-index: 999999;
        box-shadow: 0 4px 20px rgba(213, 0, 249, 0.3);
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #d500f9;
    `;
    header.innerHTML = `
        <strong style="color: #d500f9;">🐛 VIZZU Debug Console</strong>
        <div>
            <button id="clear-debug" style="background: #f44336; border: none; color: white; padding: 2px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Limpar</button>
            <button id="close-debug" style="background: #607d8b; border: none; color: white; padding: 2px 8px; border-radius: 4px; cursor: pointer;">✕</button>
        </div>
    `;
    
    const logs = document.createElement('div');
    logs.id = 'vizzu-debug-logs';
    logs.style.cssText = 'display: flex; flex-direction: column-reverse;';
    
    panel.appendChild(header);
    panel.appendChild(logs);
    document.body.appendChild(panel);
    
    // Eventos
    document.getElementById('clear-debug').onclick = () => {
        logs.innerHTML = '';
    };
    
    document.getElementById('close-debug').onclick = () => {
        panel.style.display = 'none';
    };
    
    // Arrastar painel
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    
    header.onmousedown = (e) => {
        isDragging = true;
        initialX = e.clientX - panel.offsetLeft;
        initialY = e.clientY - panel.offsetTop;
    };
    
    document.onmousemove = (e) => {
        if (isDragging) {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            panel.style.left = currentX + 'px';
            panel.style.top = currentY + 'px';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
        }
    };
    
    document.onmouseup = () => {
        isDragging = false;
    };
}

// ==================== FUNÇÃO PRINCIPAL DE LOG ====================
function vizzuLog(category, message, data = null) {
    if (!window.VIZZU_DEBUG.enabled) return;
    
    const cat = LOG_CATEGORIES[category] || LOG_CATEGORIES.CONFIG;
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    
    // Log no console
    if (window.VIZZU_DEBUG.logToConsole) {
        const style = `color: ${cat.color}; font-weight: bold;`;
        console.log(`%c[${timestamp}] ${cat.icon} ${cat.label}: ${message}`, style);
        if (data) {
            console.log('   📦 Dados:', data);
        }
    }
    
    // Log na tela
    if (window.VIZZU_DEBUG.logToScreen) {
        const logsContainer = document.getElementById('vizzu-debug-logs');
        if (logsContainer) {
            const logEntry = document.createElement('div');
            logEntry.style.cssText = `
                padding: 5px;
                margin-bottom: 5px;
                border-left: 3px solid ${cat.color};
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
            `;
            
            let html = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                    <span><strong style="color: ${cat.color};">${cat.icon} ${cat.label}</strong></span>
                    <span style="opacity: 0.6; font-size: 10px;">${timestamp}</span>
                </div>
                <div style="opacity: 0.9;">${message}</div>
            `;
            
            if (data) {
                html += `<details style="margin-top: 5px; opacity: 0.7;">
                    <summary style="cursor: pointer; color: #d500f9;">Ver dados</summary>
                    <pre style="margin: 5px 0 0 0; padding: 5px; background: rgba(0,0,0,0.3); border-radius: 4px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>
                </details>`;
            }
            
            logEntry.innerHTML = html;
            logsContainer.insertBefore(logEntry, logsContainer.firstChild);
            
            // Limitar logs na tela (máximo 50)
            while (logsContainer.children.length > 50) {
                logsContainer.removeChild(logsContainer.lastChild);
            }
        }
    }
}

// ==================== ATALHOS GLOBAIS ====================
window.vizzuLog = vizzuLog;
window.debugConfig = () => vizzuLog('CONFIG', 'Configuração Debug', window.VIZZU_DEBUG);
window.debugStorage = () => {
    const data = {
        briefings: localStorage.getItem('public_briefings'),
        clients: localStorage.getItem('clients'),
        slots: localStorage.getItem('agenda_slots')
    };
    vizzuLog('STORAGE', 'LocalStorage Dump', data);
};
window.debugClear = () => {
    localStorage.clear();
    vizzuLog('SUCCESS', 'LocalStorage limpo completamente');
};

// ==================== INTERCEPTAR ERROS ====================
window.addEventListener('error', (event) => {
    vizzuLog('ERROR', `Erro não capturado: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
    });
});

window.addEventListener('unhandledrejection', (event) => {
    vizzuLog('ERROR', `Promise rejeitada: ${event.reason}`, {
        promise: event.promise,
        reason: event.reason
    });
});

// ==================== MONITORAR FETCH ====================
const originalFetch = window.fetch;
window.fetch = function(...args) {
    const url = args[0];
    vizzuLog('API', `Fetch iniciado: ${url}`);
    
    return originalFetch.apply(this, args)
        .then(response => {
            if (!response.ok) {
                vizzuLog('ERROR', `Fetch falhou: ${url}`, {
                    status: response.status,
                    statusText: response.statusText
                });
            } else {
                vizzuLog('SUCCESS', `Fetch OK: ${url}`, {
                    status: response.status
                });
            }
            return response;
        })
        .catch(error => {
            vizzuLog('ERROR', `Fetch exception: ${url}`, error);
            throw error;
        });
};

// ==================== INICIALIZAR ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createDebugPanel);
} else {
    createDebugPanel();
}

vizzuLog('CONFIG', 'Sistema de Debug VIZZU inicializado');
vizzuLog('CONFIG', 'Comandos disponíveis no console:', {
    'vizzuLog(category, message, data)': 'Criar log manual',
    'debugConfig()': 'Ver configuração de debug',
    'debugStorage()': 'Ver conteúdo do LocalStorage',
    'debugClear()': 'Limpar LocalStorage completamente'
});

// ==================== DIAGNÓSTICO AUTOMÁTICO ====================
setTimeout(() => {
    // Verificar Supabase
    if (typeof window.supabase === 'undefined') {
        vizzuLog('WARNING', 'CDN do Supabase não detectado');
    } else {
        vizzuLog('SUCCESS', 'CDN do Supabase carregado');
    }
    
    // Verificar LocalStorage
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        vizzuLog('SUCCESS', 'LocalStorage disponível');
    } catch (e) {
        vizzuLog('ERROR', 'LocalStorage não disponível', e);
    }
    
    // Verificar dados existentes
    const briefings = localStorage.getItem('public_briefings');
    const clients = localStorage.getItem('clients');
    const slots = localStorage.getItem('agenda_slots');
    
    if (briefings || clients || slots) {
        vizzuLog('DATA', 'Dados encontrados no LocalStorage', {
            briefings: briefings ? JSON.parse(briefings).length : 0,
            clients: clients ? JSON.parse(clients).length : 0,
            slots: slots ? JSON.parse(slots).length : 0
        });
    } else {
        vizzuLog('WARNING', 'Nenhum dado encontrado no LocalStorage');
    }
}, 1000);

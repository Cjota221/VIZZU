/**
 * ===================================
 * VIZZU AGENDA PÚBLICA - LÓGICA COMPLETA
 * Sistema de reserva de slots com modal aprimorado,
 * filtros avançados e experiência de usuário profissional
 * ===================================
 */

// ==================== ESTADO GLOBAL ====================
let currentFilter = 'available';
let allSlots = [];

// ==================== INICIALIZAÇÃO ====================
async function init() {
    // Renderizar header
    document.getElementById('app-header').innerHTML = renderHeader();
    
    // Inicializar agenda (criar slots se necessário)
    await initializeAgenda();
    
    // Carregar slots
    await loadSlots();
}

// ==================== CARREGAR SLOTS ====================
async function loadSlots() {
    try {
        showLoading(true);
        
        // Obter todos os slots
        allSlots = await storage.getSlots();
        
        // Aplicar filtro atual
        await applyCurrentFilter();
        
    } catch (error) {
        console.error('Erro ao carregar slots:', error);
        showToast('Erro ao carregar slots disponíveis', 'error');
        
        // Mostrar estado vazio
        document.getElementById('slotsGrid').innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-icon">❌</div>
                <p>Erro ao carregar slots. Tente novamente.</p>
                <button class="btn btn-primary" onclick="loadSlots()">Recarregar</button>
            </div>
        `;
    } finally {
        showLoading(false);
    }
}

// ==================== APLICAR FILTRO ====================
async function applyCurrentFilter() {
    let filtered = [...allSlots];
    
    // Aplicar filtro
    if (currentFilter === 'available') {
        filtered = filtered.filter(s => s.status === 'available');
    } else if (currentFilter === 'next30') {
        const next30Days = new Date();
        next30Days.setDate(next30Days.getDate() + 30);
        filtered = filtered.filter(s => new Date(s.start_date) <= next30Days);
    } else if (currentFilter === 'next60') {
        const next60Days = new Date();
        next60Days.setDate(next60Days.getDate() + 60);
        filtered = filtered.filter(s => new Date(s.start_date) <= next60Days);
    }
    
    // Ordenar por data de início
    filtered.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    
    // Atualizar contadores
    const availableCount = allSlots.filter(s => s.status === 'available').length;
    document.getElementById('slotsCount').textContent = `${filtered.length} slots`;
    document.getElementById('availableCount').textContent = `${availableCount} disponíveis`;
    
    // Renderizar slots
    renderSlots(filtered);
}

// ==================== RENDERIZAR SLOTS ====================
function renderSlots(slots) {
    const grid = document.getElementById('slotsGrid');
    
    if (slots.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-icon">📭</div>
                <p>Nenhum slot encontrado com este filtro.</p>
                <button class="btn btn-outline" onclick="filterSlots('all')">Ver Todos</button>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    slots.forEach(slot => {
        const isAvailable = slot.status === 'available';
        const isReserved = slot.payment_status === 'pending';
        const isOccupied = !isAvailable && !isReserved;
        
        const startDate = new Date(slot.start_date);
        const endDate = new Date(slot.end_date);
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // Determinar status visual
        let statusClass = 'occupied';
        let statusBadge = '<span class="slot-badge occupied">Ocupado</span>';
        
        if (isAvailable) {
            statusClass = 'available';
            statusBadge = '<span class="slot-badge available">✅ Disponível</span>';
        } else if (isReserved) {
            statusClass = 'reserved';
            statusBadge = '<span class="slot-badge reserved">⏳ Reservado</span>';
        }
        
        html += `
            <div class="slot-card-enhanced ${statusClass}" ${isAvailable ? `onclick="openReserveModal(${slot.slot_number})"` : ''}>
                <div class="slot-header">
                    <div class="slot-number-large">
                        #${slot.slot_number}
                    </div>
                    ${statusBadge}
                </div>
                
                <div class="slot-dates-large">
                    <div class="date-row">
                        <span class="date-label">Início</span>
                        <span class="date-value">${startDate.toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div style="text-align: center; opacity: 0.5;">
                        ↓
                    </div>
                    <div class="date-row">
                        <span class="date-label">Entrega</span>
                        <span class="date-value">${endDate.toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
                
                <div class="slot-duration">
                    <div class="slot-duration-value">${duration}</div>
                    <div class="slot-duration-label">dias de desenvolvimento</div>
                </div>
                
                ${isAvailable ? `
                    <div class="slot-actions">
                        <button class="btn btn-primary btn-block" onclick="openReserveModal(${slot.slot_number}); event.stopPropagation();">
                            🚀 Reservar Agora
                        </button>
                    </div>
                ` : `
                    <div style="text-align: center; opacity: 0.6; padding: 1rem;">
                        ${isReserved ? '⏳ Aguardando confirmação de pagamento' : '🔒 Este slot já está ocupado'}
                    </div>
                `}
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

// ==================== FILTRAR SLOTS ====================
async function filterSlots(filter) {
    currentFilter = filter;
    
    // Atualizar botões ativos
    document.querySelectorAll('.filter-buttons button').forEach(btn => {
        btn.className = 'btn btn-outline';
    });
    
    const activeBtn = document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
    if (activeBtn) {
        activeBtn.className = 'btn btn-primary';
    }
    
    // Aplicar filtro
    await applyCurrentFilter();
}

// ==================== ABRIR MODAL DE RESERVA ====================
function openReserveModal(slotNumber) {
    const slot = allSlots.find(s => s.slot_number === slotNumber);
    if (!slot) {
        showToast('Slot não encontrado', 'error');
        return;
    }
    
    const startDate = new Date(slot.start_date);
    const endDate = new Date(slot.end_date);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const content = `
        <div class="reserve-modal-content">
            <!-- Indicador de Passos -->
            <div class="modal-step-indicator">
                <div class="modal-step active"></div>
                <div class="modal-step"></div>
                <div class="modal-step"></div>
            </div>
            
            <!-- Informações do Slot -->
            <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border-left: 4px solid var(--pink-neon);">
                <h3 style="margin: 0 0 1rem 0; color: var(--pink-neon);">📅 Slot #${slotNumber}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div>
                        <div style="opacity: 0.7; font-size: 0.85rem; margin-bottom: 0.25rem;">Início</div>
                        <div style="font-weight: 700;">${startDate.toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div>
                        <div style="opacity: 0.7; font-size: 0.85rem; margin-bottom: 0.25rem;">Entrega</div>
                        <div style="font-weight: 700;">${endDate.toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div>
                        <div style="opacity: 0.7; font-size: 0.85rem; margin-bottom: 0.25rem;">Duração</div>
                        <div style="font-weight: 700; color: var(--green-neon);">${duration} dias</div>
                    </div>
                </div>
            </div>
            
            <!-- Preço -->
            <div class="price-display">
                <div class="price-value">R$ 1.500,00</div>
                <div class="price-label">Investimento total do projeto</div>
            </div>
            
            <!-- Timeline do Processo -->
            <div class="timeline-visual">
                <div class="timeline-line"></div>
                <div class="timeline-points">
                    <div class="timeline-point">
                        <div class="timeline-dot-large"></div>
                        <div class="timeline-label">1. Reserva</div>
                    </div>
                    <div class="timeline-point">
                        <div class="timeline-dot-large" style="background: var(--purple-neon); box-shadow: 0 0 15px var(--purple-neon);"></div>
                        <div class="timeline-label">2. Pagamento</div>
                    </div>
                    <div class="timeline-point">
                        <div class="timeline-dot-large" style="background: var(--green-neon); box-shadow: 0 0 15px var(--green-neon);"></div>
                        <div class="timeline-label">3. Desenvolvimento</div>
                    </div>
                    <div class="timeline-point">
                        <div class="timeline-dot-large" style="background: var(--blue-neon); box-shadow: 0 0 15px var(--blue-neon);"></div>
                        <div class="timeline-label">4. Entrega</div>
                    </div>
                </div>
            </div>
            
            <!-- Formulário -->
            <form id="reserveForm" onsubmit="handleReserve(event, ${slotNumber})">
                <div class="form-section">
                    <div class="form-section-title">
                        👤 Dados de Contato
                    </div>
                    
                    <div class="form-group">
                        <label>Nome da Loja ou Empresa *</label>
                        <input type="text" name="store_name" required placeholder="Ex: Minha Loja Incrível">
                    </div>
                    
                    <div class="form-group">
                        <label>Nome de Contato *</label>
                        <input type="text" name="contact_name" required placeholder="Ex: João Silva">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label>Telefone (WhatsApp) *</label>
                            <input type="tel" name="phone" required placeholder="(11) 99999-9999">
                        </div>
                        
                        <div class="form-group">
                            <label>E-mail</label>
                            <input type="email" name="email" placeholder="contato@exemplo.com">
                        </div>
                    </div>
                </div>
                
                <!-- Informações de Pagamento -->
                <div class="payment-info-box">
                    <h4 style="margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                        💳 Próximos Passos
                    </h4>
                    <ol style="margin: 0; padding-left: 1.5rem; line-height: 1.8;">
                        <li>Preencha o formulário e clique em "Confirmar Reserva"</li>
                        <li>Você receberá as instruções de pagamento via WhatsApp</li>
                        <li>Após confirmação do pagamento, seu slot será ativado</li>
                        <li>O desenvolvimento iniciará na data marcada</li>
                    </ol>
                </div>
                
                <!-- Termos -->
                <div class="form-group">
                    <label style="display: flex; align-items: start; gap: 0.75rem; cursor: pointer;">
                        <input type="checkbox" name="terms" required style="margin-top: 0.25rem;">
                        <span style="font-size: 0.9rem; opacity: 0.9;">
                            Li e concordo com os termos de serviço. Entendo que após a confirmação do pagamento, 
                            o desenvolvimento será realizado no período agendado.
                        </span>
                    </label>
                </div>
                
                <!-- Botões -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2rem;">
                    <button type="button" class="btn btn-outline btn-block" onclick="closeModal()">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary btn-block">
                        ✅ Confirmar Reserva
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal('🚀 Reservar Slot', content, { size: 'large' });
}

// ==================== PROCESSAR RESERVA ====================
async function handleReserve(event, slotNumber) {
    event.preventDefault();
    showLoading(true);
    
    const form = event.target;
    
    // Validar campos
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    
    if (!phone) {
        showToast('Por favor, informe seu telefone', 'error');
        showLoading(false);
        return;
    }
    
    // Criar dados do cliente
    const clientData = {
        store_name: form.store_name.value.trim(),
        contact_name: form.contact_name.value.trim(),
        phone: phone,
        email: email || null,
        status: 'pending_payment'
    };
    
    try {
        // Reservar slot
        const result = await reserveSlot(slotNumber, clientData);
        
        // Fechar modal
        closeModal();
        
        // Mostrar sucesso
        showSuccessMessage(slotNumber, result.client, result.slot);
        
        // Recarregar slots
        await loadSlots();
        
    } catch (error) {
        console.error('Erro ao reservar slot:', error);
        showToast('Erro ao reservar slot. Por favor, tente novamente.', 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== MOSTRAR MENSAGEM DE SUCESSO ====================
function showSuccessMessage(slotNumber, client, slot) {
    const startDate = new Date(slot.start_date).toLocaleDateString('pt-BR');
    const endDate = new Date(slot.end_date).toLocaleDateString('pt-BR');
    
    const content = `
        <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
            <h2 style="color: var(--green-neon); margin-bottom: 1rem;">Reserva Confirmada!</h2>
            <p style="font-size: 1.1rem; margin-bottom: 2rem;">
                Parabéns! Seu slot foi reservado com sucesso.
            </p>
            
            <div style="background: var(--glass); padding: 1.5rem; border-radius: 12px; margin: 2rem 0; text-align: left;">
                <h3 style="margin: 0 0 1rem 0;">📋 Resumo da Reserva</h3>
                <ul style="list-style: none; padding: 0; margin: 0; line-height: 2;">
                    <li><strong>Slot:</strong> #${slotNumber}</li>
                    <li><strong>Cliente:</strong> ${client.store_name}</li>
                    <li><strong>Período:</strong> ${startDate} - ${endDate}</li>
                    <li><strong>Telefone:</strong> ${formatPhone(client.phone)}</li>
                    <li><strong>Valor:</strong> R$ 1.500,00</li>
                </ul>
            </div>
            
            <div style="background: rgba(124, 77, 255, 0.1); border: 1px solid var(--purple-neon); border-radius: 12px; padding: 1.5rem; margin: 2rem 0; text-align: left;">
                <h4 style="margin: 0 0 1rem 0; color: var(--pink-neon);">📱 Próximos Passos:</h4>
                <ol style="line-height: 2; padding-left: 1.5rem;">
                    <li>Em breve você receberá uma mensagem no WhatsApp <strong>${formatPhone(client.phone)}</strong></li>
                    <li>Enviaremos as instruções completas de pagamento via PIX</li>
                    <li>Após a confirmação do pagamento, seu slot será ativado</li>
                    <li>O desenvolvimento iniciará automaticamente na data marcada</li>
                </ol>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                <button class="btn btn-outline" onclick="closeModal()">Fechar</button>
                <button class="btn btn-primary" onclick="closeModal(); filterSlots('all');">
                    Ver Todos os Slots
                </button>
            </div>
        </div>
    `;
    
    showModal('✅ Reserva Realizada', content, { size: 'large' });
    
    // Tocar som de sucesso (opcional)
    showToast('Slot reservado com sucesso! Aguarde contato.', 'success');
}

// ==================== FECHAR MODAL ====================
function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// ==================== EXECUTAR ====================
init().catch(err => {
    console.error('Erro ao inicializar agenda pública:', err);
    showToast('Erro ao carregar página', 'error');
});

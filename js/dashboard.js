/**
 * ===================================
 * VIZZU DASHBOARD - LÓGICA COMPLETA
 * Dashboard administrativa com estatísticas,
 * calendário interativo, notificações e exportação
 * ===================================
 */

// ==================== DADOS SIMULADOS PARA TESTE ====================
const MOCK_DATA = {
    briefings: [
        {
            id: 1,
            token: 'tok_001',
            store_name: 'Loja das Flores',
            contact_name: 'Maria Silva',
            phone: '11987654321',
            email: 'maria@flores.com',
            status: 'pending_review',
            submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            token: 'tok_002',
            store_name: 'Tech Store Pro',
            contact_name: 'João Santos',
            phone: '11976543210',
            email: 'joao@techpro.com',
            status: 'pending_review',
            submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
    ],
    clients: [
        {
            id: 1,
            store_name: 'Café Gourmet',
            contact_name: 'Ana Costa',
            phone: '11965432109',
            status: 'paid',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
    ]
};

// ==================== INICIALIZAÇÃO ====================
async function init() {
    // Renderizar header
    document.getElementById('app-header').innerHTML = renderHeader('dashboard');
    
    // Inicializar agenda (criar slots se necessário)
    await initializeAgenda();
    
    // Carregar dados
    await loadStats();
    await loadOccupancyChart();
    await loadInteractiveCalendar();
    await loadBriefingsList();
    await loadPaymentsList();
    await loadProgressList();
    await loadTimeline();
    await updateNotifications();
}

// ==================== ESTATÍSTICAS PRINCIPAIS ====================
async function loadStats() {
    try {
        const stats = await getAgendaStats();
        const slots = await storage.getSlots();
        const briefings = await storage.getBriefings();
        
        // Calcular slots usados (total - disponíveis)
        const totalSlots = 30;
        const usedSlots = totalSlots - stats.available;
        
        // Calcular faturamento (slots pagos * 1500)
        const revenue = stats.paid * 1500;
        
        // Briefings pendentes
        const pendingBriefings = briefings.filter(b => b.status === 'pending_review').length;
        
        // Pagamentos pendentes
        const pendingPayments = slots.filter(s => s.payment_status === 'pending').length;
        
        const statsHtml = `
            <div class="stat-card pulse-slow">
                <div class="stat-icon">📊</div>
                <div class="stat-value">${usedSlots}/${totalSlots}</div>
                <div class="stat-label">Slots Ocupados</div>
                <div class="progress-bar-slim">
                    <div class="progress-fill-slim" style="width: ${(usedSlots/totalSlots)*100}%"></div>
                </div>
            </div>
            
            <div class="stat-card pulse-slow">
                <div class="stat-icon">💰</div>
                <div class="stat-value">${formatCurrency(revenue)}</div>
                <div class="stat-label">Faturamento Acumulado</div>
                <small style="opacity: 0.7; margin-top: 0.5rem; display: block;">
                    ${formatCurrency(stats.revenue.pending)} pendente
                </small>
            </div>
            
            <div class="stat-card ${pendingBriefings > 0 ? 'pulse' : ''}">
                <div class="stat-icon">📋</div>
                <div class="stat-value">${pendingBriefings}</div>
                <div class="stat-label">Briefings Pendentes</div>
            </div>
            
            <div class="stat-card ${pendingPayments > 0 ? 'pulse' : ''}">
                <div class="stat-icon">⏳</div>
                <div class="stat-value">${pendingPayments}</div>
                <div class="stat-label">Pagamentos Pendentes</div>
            </div>
        `;
        
        document.getElementById('statsGrid').innerHTML = statsHtml;
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        showToast('Erro ao carregar estatísticas', 'error');
    }
}

// ==================== GRÁFICO DE OCUPAÇÃO (7 DIAS) ====================
async function loadOccupancyChart() {
    try {
        const days = await getNext7DaysSlots();
        
        let occupied = 0;
        days.forEach(day => {
            if (day.slot && day.slot.status !== 'available') {
                occupied++;
            }
        });
        
        const percentage = (occupied / 7) * 100;
        
        const html = `
            <div style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                    <strong>${occupied}/7 dias ocupados</strong>
                    <span style="color: var(--pink-neon);">${Math.round(percentage)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.85rem; opacity: 0.7;">
                    <span>Próximos 7 dias corridos</span>
                    <span>${7 - occupied} livres</span>
                </div>
            </div>
        `;
        
        document.getElementById('occupancyProgress').innerHTML = html;
        
    } catch (error) {
        console.error('Erro ao carregar ocupação:', error);
    }
}

// ==================== CALENDÁRIO INTERATIVO (7 DIAS) ====================
async function loadInteractiveCalendar() {
    try {
        const days = await getNext7DaysSlots();
        
        let html = '';
        
        days.forEach((day, index) => {
            const slot = day.slot;
            let status = 'available';
            let statusText = '✅ Livre';
            let clientName = '';
            
            if (slot) {
                if (slot.status === 'available') {
                    status = 'available';
                    statusText = '✅ Livre';
                } else if (slot.payment_status === 'pending') {
                    status = 'pending';
                    statusText = '⏳ Pend. Pgto';
                    clientName = `<div style="font-size: 0.75rem; margin-top: 0.5rem; opacity: 0.8;">Slot #${slot.slot_number}</div>`;
                } else {
                    status = 'occupied';
                    statusText = '🔒 Ocupado';
                    clientName = `<div style="font-size: 0.75rem; margin-top: 0.5rem; opacity: 0.8;">Slot #${slot.slot_number}</div>`;
                }
            } else {
                statusText = '⚪ Sem slot';
            }
            
            html += `
                <div class="day-card ${status}" onclick="showDayDetails(${index}, ${JSON.stringify(day).replace(/"/g, '&quot;')})">
                    <div>
                        <div style="font-weight: 700; font-size: 0.9rem; opacity: 0.7; margin-bottom: 0.25rem;">
                            ${day.dayOfWeek}
                        </div>
                        <div style="font-size: 1.75rem; font-weight: 700; color: var(--pink-neon);">
                            ${day.dayNumber}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; font-weight: 600;">
                            ${statusText}
                        </div>
                        ${clientName}
                    </div>
                </div>
            `;
        });
        
        document.getElementById('calendarInteractive').innerHTML = html;
        
    } catch (error) {
        console.error('Erro ao carregar calendário:', error);
    }
}

// ==================== MOSTRAR DETALHES DO DIA ====================
function showDayDetails(index, day) {
    const slot = day.slot;
    
    let content = `
        <h3 style="margin-top: 0;">${day.dayOfWeek}, ${day.dayNumber} de ${day.monthName}</h3>
    `;
    
    if (!slot) {
        content += `<p>Nenhum slot disponível para este dia.</p>`;
    } else {
        content += `
            <div style="background: var(--glass); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <strong>Slot #${slot.slot_number}</strong><br>
                <span style="opacity: 0.7;">
                    ${new Date(slot.start_date).toLocaleDateString('pt-BR')} - 
                    ${new Date(slot.end_date).toLocaleDateString('pt-BR')}
                </span>
            </div>
            
            <p><strong>Status:</strong> ${getStatusBadge(slot.status)}</p>
        `;
        
        if (slot.status === 'available') {
            content += `
                <p style="color: var(--green-neon);">✅ Este slot está disponível para reserva!</p>
                <button class="btn btn-primary" onclick="window.location.href='agenda-publica.html'">
                    Ver Agenda Pública
                </button>
            `;
        } else {
            content += `
                <p><strong>Pagamento:</strong> ${slot.payment_status || 'N/A'}</p>
                <button class="btn btn-primary" onclick="window.location.href='clientes.html'">
                    Ver Detalhes do Cliente
                </button>
            `;
        }
    }
    
    showModal('Detalhes do Dia', content);
}

// ==================== LISTA DE BRIEFINGS PENDENTES ====================
async function loadBriefingsList() {
    try {
        const briefings = await storage.getBriefings();
        const pending = briefings.filter(b => b.status === 'pending_review');
        
        document.getElementById('briefingCount').textContent = pending.length;
        
        if (pending.length === 0) {
            document.getElementById('briefingsList').innerHTML = `
                <p style="color: rgba(255,255,255,0.5); text-align: center; padding: 2rem;">
                    ✅ Nenhum briefing pendente
                </p>
            `;
            return;
        }
        
        let html = '';
        pending.slice(0, 5).forEach(b => {
            const daysAgo = Math.floor((Date.now() - new Date(b.submitted_at)) / (1000 * 60 * 60 * 24));
            const isUrgent = daysAgo > 3;
            
            html += `
                <div class="briefing-card ${isUrgent ? 'pulse' : ''}" onclick="showBriefingDetails('${b.token}')">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <strong>${b.store_name}</strong>
                        ${isUrgent ? '<span class="badge badge-danger">Urgente</span>' : ''}
                    </div>
                    <div style="font-size: 0.85rem; opacity: 0.7;">
                        ${b.contact_name || 'Sem contato'}<br>
                        Há ${daysAgo} dias
                    </div>
                </div>
            `;
        });
        
        if (pending.length > 5) {
            html += `
                <p style="text-align: center; opacity: 0.7; margin-top: 1rem;">
                    +${pending.length - 5} briefings não exibidos
                </p>
            `;
        }
        
        document.getElementById('briefingsList').innerHTML = html;
        
    } catch (error) {
        console.error('Erro ao carregar briefings:', error);
    }
}

// ==================== LISTA DE PAGAMENTOS PENDENTES ====================
async function loadPaymentsList() {
    try {
        const slots = await storage.getSlots();
        const pending = slots.filter(s => s.payment_status === 'pending');
        
        document.getElementById('paymentCount').textContent = pending.length;
        
        if (pending.length === 0) {
            document.getElementById('paymentsList').innerHTML = `
                <p style="color: rgba(255,255,255,0.5); text-align: center; padding: 2rem;">
                    ✅ Nenhum pagamento pendente
                </p>
            `;
            return;
        }
        
        let html = '';
        for (const slot of pending.slice(0, 5)) {
            const client = slot.client_id ? await storage.getClientById(slot.client_id) : null;
            const daysAgo = slot.reserved_at 
                ? Math.floor((Date.now() - new Date(slot.reserved_at)) / (1000 * 60 * 60 * 24))
                : 0;
            
            html += `
                <div class="briefing-card" style="border-left-color: #ffc107;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <strong>Slot #${slot.slot_number}</strong>
                        <span class="badge badge-warning">Pendente</span>
                    </div>
                    <div style="font-size: 0.85rem; opacity: 0.7;">
                        ${client ? client.store_name : 'Cliente não identificado'}<br>
                        Reservado há ${daysAgo} dias
                    </div>
                </div>
            `;
        }
        
        document.getElementById('paymentsList').innerHTML = html;
        
    } catch (error) {
        console.error('Erro ao carregar pagamentos:', error);
    }
}

// ==================== LISTA DE PROJETOS EM ANDAMENTO ====================
async function loadProgressList() {
    try {
        const slots = await storage.getSlots();
        const inProgress = slots.filter(s => s.status === 'in_progress');
        
        document.getElementById('progressCount').textContent = inProgress.length;
        
        if (inProgress.length === 0) {
            document.getElementById('progressList').innerHTML = `
                <p style="color: rgba(255,255,255,0.5); text-align: center; padding: 2rem;">
                    📭 Nenhum projeto em andamento
                </p>
            `;
            return;
        }
        
        let html = '';
        for (const slot of inProgress.slice(0, 5)) {
            const client = slot.client_id ? await storage.getClientById(slot.client_id) : null;
            const daysLeft = getDaysRemaining(slot.end_date);
            
            html += `
                <div class="briefing-card" style="border-left-color: var(--blue-neon);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <strong>Slot #${slot.slot_number}</strong>
                        <span class="badge badge-info">${daysLeft}d</span>
                    </div>
                    <div style="font-size: 0.85rem; opacity: 0.7;">
                        ${client ? client.store_name : 'Cliente não identificado'}<br>
                        Entrega: ${new Date(slot.end_date).toLocaleDateString('pt-BR')}
                    </div>
                </div>
            `;
        }
        
        document.getElementById('progressList').innerHTML = html;
        
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
    }
}

// ==================== TIMELINE DE ATIVIDADES ====================
async function loadTimeline() {
    try {
        const slots = await storage.getSlots();
        const briefings = await storage.getBriefings();
        
        // Criar timeline de eventos
        const events = [];
        
        // Briefings recentes
        briefings.slice(0, 3).forEach(b => {
            events.push({
                date: new Date(b.submitted_at),
                type: 'briefing',
                icon: '📋',
                title: 'Novo Briefing Recebido',
                description: `${b.store_name} enviou briefing`
            });
        });
        
        // Reservas recentes
        slots.filter(s => s.reserved_at).slice(0, 3).forEach(s => {
            events.push({
                date: new Date(s.reserved_at),
                type: 'reservation',
                icon: '📅',
                title: 'Slot Reservado',
                description: `Slot #${s.slot_number} foi reservado`
            });
        });
        
        // Ordenar por data (mais recente primeiro)
        events.sort((a, b) => b.date - a.date);
        
        let html = '';
        events.slice(0, 10).forEach(event => {
            const timeAgo = getTimeAgo(event.date);
            
            html += `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div style="margin-bottom: 0.5rem;">
                        <strong>${event.icon} ${event.title}</strong>
                    </div>
                    <div style="opacity: 0.7; font-size: 0.9rem; margin-bottom: 0.25rem;">
                        ${event.description}
                    </div>
                    <div style="opacity: 0.5; font-size: 0.85rem;">
                        ${timeAgo}
                    </div>
                </div>
            `;
        });
        
        if (events.length === 0) {
            html = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 2rem;">Nenhuma atividade recente</p>';
        }
        
        document.getElementById('timeline').innerHTML = html;
        
    } catch (error) {
        console.error('Erro ao carregar timeline:', error);
    }
}

// ==================== NOTIFICAÇÕES ====================
async function updateNotifications() {
    try {
        const briefings = await storage.getBriefings();
        const slots = await storage.getSlots();
        
        // Contar alertas
        const urgentBriefings = briefings.filter(b => {
            const daysAgo = Math.floor((Date.now() - new Date(b.submitted_at)) / (1000 * 60 * 60 * 24));
            return b.status === 'pending_review' && daysAgo > 3;
        }).length;
        
        const pendingPayments = slots.filter(s => s.payment_status === 'pending').length;
        const deadlineSoon = slots.filter(s => {
            if (s.status !== 'in_progress') return false;
            const daysLeft = getDaysRemaining(s.end_date);
            return daysLeft <= 2 && daysLeft >= 0;
        }).length;
        
        const totalAlerts = urgentBriefings + pendingPayments + deadlineSoon;
        
        if (totalAlerts > 0) {
            document.getElementById('notificationBadge').style.display = 'flex';
            document.getElementById('notificationBadge').textContent = totalAlerts;
            document.getElementById('notificationCount').textContent = `${totalAlerts} alertas`;
        } else {
            document.getElementById('notificationBadge').style.display = 'none';
            document.getElementById('notificationCount').textContent = '0 alertas';
        }
        
    } catch (error) {
        console.error('Erro ao atualizar notificações:', error);
    }
}

// ==================== MOSTRAR NOTIFICAÇÕES ====================
async function showNotifications() {
    const briefings = await storage.getBriefings();
    const slots = await storage.getSlots();
    
    let notifications = [];
    
    // Briefings urgentes
    briefings.forEach(b => {
        const daysAgo = Math.floor((Date.now() - new Date(b.submitted_at)) / (1000 * 60 * 60 * 24));
        if (b.status === 'pending_review' && daysAgo > 3) {
            notifications.push({
                icon: '🔴',
                title: 'Briefing Urgente',
                message: `${b.store_name} - ${daysAgo} dias pendente`
            });
        }
    });
    
    // Pagamentos pendentes
    slots.filter(s => s.payment_status === 'pending').forEach(s => {
        notifications.push({
            icon: '💰',
            title: 'Pagamento Pendente',
            message: `Slot #${s.slot_number} aguardando confirmação`
        });
    });
    
    // Prazos próximos
    slots.forEach(s => {
        if (s.status !== 'in_progress') return;
        const daysLeft = getDaysRemaining(s.end_date);
        if (daysLeft <= 2 && daysLeft >= 0) {
            notifications.push({
                icon: '⏰',
                title: 'Prazo Próximo',
                message: `Slot #${s.slot_number} - ${daysLeft} dias restantes`
            });
        }
    });
    
    let content = '';
    if (notifications.length === 0) {
        content = '<p style="text-align: center; opacity: 0.7; padding: 2rem;">✅ Nenhuma notificação</p>';
    } else {
        content = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
        notifications.forEach(n => {
            content += `
                <div style="background: var(--glass); padding: 1rem; border-radius: 8px; border-left: 3px solid var(--pink-neon);">
                    <div style="font-size: 1.25rem; margin-bottom: 0.5rem;">${n.icon}</div>
                    <strong>${n.title}</strong><br>
                    <span style="opacity: 0.7; font-size: 0.9rem;">${n.message}</span>
                </div>
            `;
        });
        content += '</div>';
    }
    
    showModal('🔔 Notificações', content);
}

// ==================== MOSTRAR GERADOR DE LINKS ====================
function showLinkGenerator() {
    const briefingLink = `${window.location.origin}/briefing.html`;
    const agendaLink = `${window.location.origin}/agenda-publica.html`;
    
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div>
                <strong>📋 Link do Briefing Público</strong>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                    <input type="text" value="${briefingLink}" readonly 
                           style="flex: 1; padding: 0.75rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 8px; color: white;">
                    <button class="btn btn-primary" onclick="copyToClipboard('${briefingLink}')">
                        Copiar
                    </button>
                </div>
            </div>
            
            <div>
                <strong>📅 Link da Agenda Pública</strong>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                    <input type="text" value="${agendaLink}" readonly 
                           style="flex: 1; padding: 0.75rem; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 8px; color: white;">
                    <button class="btn btn-primary" onclick="copyToClipboard('${agendaLink}')">
                        Copiar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showModal('🔗 Gerar Links Públicos', content);
}

// ==================== EXPORTAÇÃO DE DADOS ====================
function toggleExportMenu() {
    const menu = document.getElementById('exportMenu');
    menu.classList.toggle('active');
}

async function exportData(format) {
    toggleExportMenu();
    showLoading(true);
    
    try {
        const briefings = await storage.getBriefings();
        const slots = await storage.getSlots();
        const clients = await storage.getClients();
        
        const data = {
            briefings,
            slots,
            clients,
            exportedAt: new Date().toISOString()
        };
        
        if (format === 'json') {
            // Exportar JSON
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vizzu-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
        } else if (format === 'csv') {
            // Exportar CSV (clientes)
            let csv = 'Loja,Contato,Telefone,Email,Status,Data\n';
            clients.forEach(c => {
                csv += `"${c.store_name}","${c.contact_name}","${c.phone}","${c.email || ''}","${c.status}","${new Date(c.created_at).toLocaleDateString('pt-BR')}"\n`;
            });
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vizzu-clientes-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
        
        showToast('Exportação concluída com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao exportar:', error);
        showToast('Erro ao exportar dados', 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== GERAR RELATÓRIO ====================
async function generateReport() {
    showLoading(true);
    
    try {
        const stats = await getAgendaStats();
        const briefings = await storage.getBriefings();
        const slots = await storage.getSlots();
        
        const content = `
            <div style="text-align: left;">
                <h3 style="margin-top: 0;">📊 Relatório VIZZU</h3>
                <p style="opacity: 0.7;">Gerado em ${new Date().toLocaleString('pt-BR')}</p>
                
                <hr style="border: 1px solid var(--glass-border); margin: 1.5rem 0;">
                
                <h4>Estatísticas Gerais</h4>
                <ul>
                    <li>Total de Slots: 30</li>
                    <li>Slots Disponíveis: ${stats.available}</li>
                    <li>Slots Reservados: ${stats.reserved}</li>
                    <li>Slots Pagos: ${stats.paid}</li>
                    <li>Projetos em Andamento: ${stats.inProgress}</li>
                    <li>Projetos Concluídos: ${stats.completed}</li>
                </ul>
                
                <h4>Financeiro</h4>
                <ul>
                    <li>Receita Confirmada: ${formatCurrency(stats.revenue.confirmed)}</li>
                    <li>Receita Pendente: ${formatCurrency(stats.revenue.pending)}</li>
                    <li>Receita Total: ${formatCurrency(stats.revenue.total)}</li>
                </ul>
                
                <h4>Briefings</h4>
                <ul>
                    <li>Total Recebidos: ${briefings.length}</li>
                    <li>Pendentes de Análise: ${briefings.filter(b => b.status === 'pending_review').length}</li>
                </ul>
                
                <button class="btn btn-primary" onclick="window.print()" style="margin-top: 1rem;">
                    🖨️ Imprimir Relatório
                </button>
            </div>
        `;
        
        showModal('📈 Relatório Completo', content);
        
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        showToast('Erro ao gerar relatório', 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== ATUALIZAR DASHBOARD ====================
async function refreshDashboard() {
    showLoading(true);
    
    try {
        await loadStats();
        await loadOccupancyChart();
        await loadInteractiveCalendar();
        await loadBriefingsList();
        await loadPaymentsList();
        await loadProgressList();
        await loadTimeline();
        await updateNotifications();
        
        showToast('Dashboard atualizada!', 'success');
        
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        showToast('Erro ao atualizar dashboard', 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== MOSTRAR DETALHES DO BRIEFING ====================
async function showBriefingDetails(token) {
    try {
        const briefings = await storage.getBriefings();
        const briefing = briefings.find(b => b.token === token);
        
        if (!briefing) {
            showToast('Briefing não encontrado', 'error');
            return;
        }
        
        const content = `
            <div style="text-align: left;">
                <h3 style="margin-top: 0;">${briefing.store_name}</h3>
                <p><strong>Contato:</strong> ${briefing.contact_name}</p>
                <p><strong>Telefone:</strong> ${formatPhone(briefing.phone)}</p>
                <p><strong>Email:</strong> ${briefing.email || 'Não informado'}</p>
                <p><strong>Status:</strong> ${getStatusBadge(briefing.status)}</p>
                <p><strong>Enviado:</strong> ${new Date(briefing.submitted_at).toLocaleString('pt-BR')}</p>
                
                <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
                    <button class="btn btn-primary" onclick="window.location.href='clientes.html'">
                        Ver Todos os Briefings
                    </button>
                </div>
            </div>
        `;
        
        showModal('📋 Detalhes do Briefing', content);
        
    } catch (error) {
        console.error('Erro ao mostrar detalhes:', error);
        showToast('Erro ao carregar detalhes', 'error');
    }
}

// ==================== HELPERS ====================
function getTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date) / 1000);
    
    if (seconds < 60) return 'Agora mesmo';
    if (seconds < 3600) return `Há ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Há ${Math.floor(seconds / 3600)} horas`;
    if (seconds < 604800) return `Há ${Math.floor(seconds / 86400)} dias`;
    
    return date.toLocaleDateString('pt-BR');
}

function getDaysRemaining(endDate) {
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
}

// ==================== FECHAR MENU AO CLICAR FORA ====================
document.addEventListener('click', (e) => {
    const exportMenu = document.getElementById('exportMenu');
    if (exportMenu && !e.target.closest('.btn-primary') && !e.target.closest('.export-menu')) {
        exportMenu.classList.remove('active');
    }
});

// ==================== EXECUTAR ====================
init().catch(err => {
    console.error('Erro ao inicializar dashboard:', err);
    showToast('Erro ao carregar dashboard', 'error');
});

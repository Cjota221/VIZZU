/* ========================================
   VIZZU - LÓGICA DE AGENDA SEQUENCIAL
   Sistema de 7 dias por slot
   ======================================== */

// ==================== INICIALIZAÇÃO ====================
async function initializeAgenda() {
    vizzuLog('QUERY', '🚀 Inicializando agenda...');
    
    try {
        const slots = await storage.getSlots();
        vizzuLog('DATA', `${slots.length} slots encontrados`);
        
        // Se não houver slots, criar os 30 primeiros
        if (slots.length === 0) {
            vizzuLog('WARNING', 'Nenhum slot encontrado. Criando slots iniciais...');
            await createInitialSlots();
        } else {
            vizzuLog('SUCCESS', 'Agenda já inicializada');
        }
    } catch (error) {
        vizzuLog('ERROR', 'Erro ao inicializar agenda', error);
        throw error;
    }
}

// ==================== CRIAR SLOTS INICIAIS ====================
async function createInitialSlots() {
    vizzuLog('QUERY', 'Criando 30 slots iniciais...');
    
    const TOTAL_SLOTS = 30;
    const DAYS_PER_SLOT = 7;
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    try {
        for (let i = 0; i < TOTAL_SLOTS; i++) {
            const startDate = new Date(currentDate);
            const endDate = new Date(currentDate);
            endDate.setDate(endDate.getDate() + DAYS_PER_SLOT - 1);
            
            await storage.createSlot({
                slot_number: i + 1,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                status: 'available',
                payment_status: null,
                client_id: null,
                reserved_at: null,
                payment_confirmed_at: null,
                completed_at: null
            });
            
            // Próximo slot começa no dia seguinte ao fim do atual
            currentDate.setDate(currentDate.getDate() + DAYS_PER_SLOT);
        }
        
        vizzuLog('SUCCESS', `✅ ${TOTAL_SLOTS} slots criados com sucesso`);
    } catch (error) {
        vizzuLog('ERROR', 'Erro ao criar slots iniciais', error);
        throw error;
    }
}

// ==================== OBTER PRÓXIMO SLOT DISPONÍVEL ====================
async function getNextAvailableSlot() {
    const slots = await storage.getSlots();
    const today = new Date().toISOString().split('T')[0];
    
    return slots.find(slot => 
        slot.status === 'available' && 
        slot.start_date >= today
    );
}

// ==================== RESERVAR SLOT ====================
async function reserveSlot(slotId, clientData) {
    try {
        // Criar cliente
        const client = await storage.createClient({
            store_name: clientData.storeName,
            contact_name: clientData.contactName,
            phone: clientData.phone,
            email: clientData.email,
            status: 'pending_payment'
        });
        
        // Atualizar slot
        const slot = await storage.updateSlot(slotId, {
            status: 'reserved',
            payment_status: 'pending',
            client_id: client.id,
            reserved_at: new Date().toISOString()
        });
        
        return { client, slot };
    } catch (error) {
        console.error('Erro ao reservar slot:', error);
        throw error;
    }
}

// ==================== CONFIRMAR PAGAMENTO ====================
async function confirmPayment(slotId, paymentProof = null) {
    try {
        const slot = await storage.updateSlot(slotId, {
            status: 'paid',
            payment_status: 'confirmed',
            payment_confirmed_at: new Date().toISOString(),
            payment_proof: paymentProof
        });
        
        // Atualizar status do cliente
        if (slot.client_id) {
            await storage.updateClient(slot.client_id, {
                status: 'paid'
            });
        }
        
        return slot;
    } catch (error) {
        console.error('Erro ao confirmar pagamento:', error);
        throw error;
    }
}

// ==================== MARCAR SLOT COMO COMPLETO ====================
async function completeSlot(slotId) {
    try {
        const slot = await storage.updateSlot(slotId, {
            status: 'completed',
            completed_at: new Date().toISOString()
        });
        
        // Atualizar cliente
        if (slot.client_id) {
            await storage.updateClient(slot.client_id, {
                status: 'completed'
            });
        }
        
        return slot;
    } catch (error) {
        console.error('Erro ao completar slot:', error);
        throw error;
    }
}

// ==================== OBTER SLOTS POR STATUS ====================
async function getSlotsByStatus(status) {
    const slots = await storage.getSlots();
    return slots.filter(slot => slot.status === status);
}

// ==================== CALCULAR ESTATÍSTICAS ====================
async function getAgendaStats() {
    const slots = await storage.getSlots();
    const today = new Date().toISOString().split('T')[0];
    
    // Slots nos próximos 30 dias
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    const upcoming = slots.filter(s => 
        s.start_date >= today && 
        s.start_date <= futureDateStr
    );
    
    const stats = {
        total: slots.length,
        available: slots.filter(s => s.status === 'available').length,
        reserved: slots.filter(s => s.status === 'reserved').length,
        paid: slots.filter(s => s.status === 'paid').length,
        inProgress: slots.filter(s => s.status === 'in_progress').length,
        completed: slots.filter(s => s.status === 'completed').length,
        upcomingAvailable: upcoming.filter(s => s.status === 'available').length,
        pendingPayment: slots.filter(s => s.payment_status === 'pending').length
    };
    
    // Calcular receita
    const pricePerSlot = 2500; // R$ 2.500 por projeto
    stats.revenue = {
        confirmed: stats.paid * pricePerSlot,
        pending: stats.reserved * pricePerSlot,
        total: stats.completed * pricePerSlot
    };
    
    return stats;
}

// ==================== OBTER PRÓXIMOS 7 DIAS (DASHBOARD) ====================
async function getNext7DaysSlots() {
    const slots = await storage.getSlots();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const next7Days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Encontrar slot que contém este dia
        const slot = slots.find(s => 
            s.start_date <= dateStr && 
            s.end_date >= dateStr
        );
        
        next7Days.push({
            date: dateStr,
            dayOfWeek: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
            dayNumber: date.getDate(),
            month: date.toLocaleDateString('pt-BR', { month: 'short' }),
            slot: slot || null
        });
    }
    
    return next7Days;
}

// ==================== FORMATAR DATA ====================
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateShort(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
    });
}

// ==================== DIAS RESTANTES ====================
function getDaysRemaining(endDate) {
    const end = new Date(endDate + 'T23:59:59');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
}

// ==================== GERAR LINK PÚBLICO ====================
function generatePublicLink(type = 'agenda') {
    const token = generateToken();
    const baseUrl = window.location.origin;
    
    if (type === 'agenda') {
        return `${baseUrl}/agenda-publica.html?token=${token}`;
    } else if (type === 'briefing') {
        return `${baseUrl}/briefing.html?token=${token}`;
    }
    
    return null;
}

function generateToken() {
    return 'vizzu_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// ==================== WHATSAPP HELPER ====================
function sendWhatsAppNotification(phone, message) {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

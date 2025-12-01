/* ========================================
   VIZZU - SUPABASE CLIENT
   Configuração + RLS Policies + Debug
   ======================================== */

// ==================== DEBUG MODE ====================
const DEBUG_MODE = true; // Ativar logs detalhados

function debugLog(categoria, mensagem, dados = null) {
    if (!DEBUG_MODE) return;
    
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const estilo = {
        '🔧': 'color: #2196F3; font-weight: bold;', // Config
        '✅': 'color: #4CAF50; font-weight: bold;', // Sucesso
        '❌': 'color: #F44336; font-weight: bold;', // Erro
        '⚠️': 'color: #FF9800; font-weight: bold;', // Aviso
        '📊': 'color: #9C27B0; font-weight: bold;', // Dados
        '🔍': 'color: #00BCD4; font-weight: bold;'  // Query
    };
    
    console.log(`%c[${timestamp}] ${categoria} ${mensagem}`, estilo[categoria] || '');
    if (dados) {
        console.log('   📦 Dados:', dados);
    }
}

// ==================== CONFIGURAÇÃO ====================
const SUPABASE_URL = 'https://qnozgkocxxzrczyczaio.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFub3pna29jeHh6cmN6eWN6YWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwODQzNjQsImV4cCI6MjA0ODY2MDM2NH0.cZUVJ7qeN-3p9LrY8vZ5xHGqJ_6wK8FZdVxN0FJTxQo';

debugLog('🔧', 'Configuração Supabase:', {
    url: SUPABASE_URL,
    keyLength: SUPABASE_ANON_KEY.length,
    keyPreview: SUPABASE_ANON_KEY.substring(0, 50) + '...'
});

// Cliente Supabase (importar via CDN no HTML)
let supabase;

if (typeof window !== 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    debugLog('✅', 'Cliente Supabase criado com sucesso');
} else {
    debugLog('⚠️', 'CDN do Supabase não carregado - usando LocalStorage');
}

// ==================== FALLBACK LOCALSTORAGE (DESENVOLVIMENTO) ====================
const USE_SUPABASE = false; // false = LocalStorage | true = Supabase

debugLog('🔧', `Modo de armazenamento: ${USE_SUPABASE ? 'SUPABASE' : 'LOCALSTORAGE'}`);

class StorageAdapter {
    constructor() {
        this.useSupabase = USE_SUPABASE && supabase;
    }

    // ==================== BRIEFINGS ====================
    async getBriefings() {
        if (this.useSupabase) {
            const { data, error } = await supabase
                .from('public_briefings')
                .select('*')
                .order('submitted_at', { ascending: false });
            
            if (error) throw error;
            return data;
        }
        
        const data = localStorage.getItem('public_briefings');
        return data ? JSON.parse(data) : [];
    }

    async createBriefing(briefingData) {
        if (this.useSupabase) {
            const { data, error } = await supabase
                .from('public_briefings')
                .insert([briefingData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
        
        const briefings = await this.getBriefings();
        const newBriefing = {
            id: Date.now(),
            ...briefingData,
            submitted_at: new Date().toISOString()
        };
        briefings.push(newBriefing);
        localStorage.setItem('public_briefings', JSON.stringify(briefings));
        return newBriefing;
    }

    async getBriefingByToken(token) {
        if (this.useSupabase) {
            const { data, error } = await supabase
                .from('public_briefings')
                .select('*')
                .eq('token', token)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        }
        
        const briefings = await this.getBriefings();
        return briefings.find(b => b.token === token);
    }

    // ==================== AGENDA SLOTS ====================
    async getSlots() {
        if (this.useSupabase) {
            const { data, error } = await supabase
                .from('agenda_slots')
                .select('*')
                .order('start_date', { ascending: true });
            
            if (error) throw error;
            return data;
        }
        
        const data = localStorage.getItem('agenda_slots');
        return data ? JSON.parse(data) : [];
    }

    async createSlot(slotData) {
        if (this.useSupabase) {
            const { data, error } = await supabase
                .from('agenda_slots')
                .insert([slotData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
        
        const slots = await this.getSlots();
        const newSlot = {
            id: Date.now().toString(),
            ...slotData,
            created_at: new Date().toISOString()
        };
        slots.push(newSlot);
        localStorage.setItem('agenda_slots', JSON.stringify(slots));
        return newSlot;
    }

    async updateSlot(id, updates) {
        if (this.useSupabase) {
            const { data, error } = await supabase
                .from('agenda_slots')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
        
        const slots = await this.getSlots();
        const index = slots.findIndex(s => s.id === id);
        if (index !== -1) {
            slots[index] = { ...slots[index], ...updates };
            localStorage.setItem('agenda_slots', JSON.stringify(slots));
            return slots[index];
        }
        throw new Error('Slot não encontrado');
    }

    // ==================== CLIENTES ====================
    async getClients() {
        if (this.useSupabase) {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data;
        }
        
        const data = localStorage.getItem('clientes');
        return data ? JSON.parse(data) : [];
    }

    async createClient(clientData) {
        if (this.useSupabase) {
            const { data, error } = await supabase
                .from('clients')
                .insert([clientData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
        
        const clients = await this.getClients();
        const newClient = {
            id: Date.now(),
            ...clientData,
            created_at: new Date().toISOString()
        };
        clients.push(newClient);
        localStorage.setItem('clientes', JSON.stringify(clients));
        return newClient;
    }

    async updateClient(id, updates) {
        if (this.useSupabase) {
            const { data, error } = await supabase
                .from('clients')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
        
        const clients = await this.getClients();
        const index = clients.findIndex(c => c.id === id);
        if (index !== -1) {
            clients[index] = { ...clients[index], ...updates };
            localStorage.setItem('clientes', JSON.stringify(clients));
            return clients[index];
        }
        throw new Error('Cliente não encontrado');
    }

    async getClientById(id) {
        if (this.useSupabase) {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return data;
        }
        
        const clients = await this.getClients();
        return clients.find(c => c.id == id);
    }

    // ==================== ARQUIVOS ====================
    async getFiles(clientId) {
        if (this.useSupabase) {
            const { data, error } = await supabase
                .from('files')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data;
        }
        
        const data = localStorage.getItem('files');
        const allFiles = data ? JSON.parse(data) : [];
        return allFiles.filter(f => f.client_id == clientId);
    }

    async saveFile(fileData) {
        if (this.useSupabase) {
            const { data, error } = await supabase
                .from('files')
                .upsert([fileData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
        
        const data = localStorage.getItem('files');
        const files = data ? JSON.parse(data) : [];
        
        const existingIndex = files.findIndex(
            f => f.client_id == fileData.client_id && f.type === fileData.type
        );
        
        if (existingIndex !== -1) {
            files[existingIndex] = { ...files[existingIndex], ...fileData };
        } else {
            files.push({
                id: Date.now(),
                ...fileData,
                created_at: new Date().toISOString()
            });
        }
        
        localStorage.setItem('files', JSON.stringify(files));
        return fileData;
    }
}

// Exportar instância única
const storage = new StorageAdapter();

// ==================== RLS POLICIES (SUPABASE SQL) ====================
/*
-- Briefings públicos (INSERT apenas)
CREATE POLICY "Anyone can insert briefings" ON public_briefings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view briefings" ON public_briefings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Agenda Slots (SELECT público, INSERT/UPDATE admin)
CREATE POLICY "Anyone can view available slots" ON agenda_slots
    FOR SELECT USING (status = 'available' OR auth.role() = 'authenticated');

CREATE POLICY "Admin can manage slots" ON agenda_slots
    FOR ALL USING (auth.role() = 'authenticated');

-- Clientes (Admin apenas)
CREATE POLICY "Admin only clients" ON clients
    FOR ALL USING (auth.role() = 'authenticated');

-- Arquivos (Admin apenas)
CREATE POLICY "Admin only files" ON files
    FOR ALL USING (auth.role() = 'authenticated');
*/

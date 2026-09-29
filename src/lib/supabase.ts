import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Chamado } from '../types/ticket';

// Configuração Supabase automática via variáveis de ambiente
const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Fallback opcional armazenado silenciosamente
let savedConfig = { url: '', key: '' };
try {
  const stored = localStorage.getItem('__sgc_supabase_cfg');
  if (stored) {
    savedConfig = JSON.parse(stored);
  }
} catch {
  // Ignora se não houver acesso ao localStorage
}

const supabaseUrl = envUrl || savedConfig.url;
const supabaseAnonKey = envKey || savedConfig.key;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 10
);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  } catch (err) {
    console.warn('Erro ao inicializar Supabase client:', err);
    supabaseInstance = null;
  }
}

export const supabase = supabaseInstance;

// Armazenamento local resiliente
const STORAGE_KEY = 'sgc_chamados_manutencao_v1';

const INITIAL_CHAMADOS: Chamado[] = [
  {
    id: 'chm-001',
    codigo: 'CHM-1024',
    titulo: 'Vazamento de fluido na unidade hidráulica principal',
    equipamento: 'Injetora Hidráulica Romi 350T',
    tag: 'INJ-04',
    setor: 'Injeção Plástica - Pavilhão A',
    tipo_falha: 'hidraulica',
    prioridade: 'critica',
    linha_parada: true,
    descricao_problema: 'Queda de pressão no circuito de fechamento do molde. Poça de óleo ISO VG 68 visível sob a bomba secundária. Sensor de nível baixo acionado.',
    operador_nome: 'Carlos Oliveira',
    operador_login: 'operador',
    created_at: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    status: 'aberto',
  },
  {
    id: 'chm-002',
    codigo: 'CHM-1025',
    titulo: 'Ruído excessivo e vibração no rolamento do fuso',
    equipamento: 'Torno CNC Mazak Quick Turn 250',
    tag: 'CNC-08',
    setor: 'Usinagem de Precisão',
    tipo_falha: 'mecanica',
    prioridade: 'alta',
    linha_parada: false,
    descricao_problema: 'Ao ultrapassar 2500 RPM, apresenta chiado estridente no mancal dianteiro. Temperatura do cabeçote atingiu 68°C em 20 min de usinagem.',
    operador_nome: 'Carlos Oliveira',
    operador_login: 'operador',
    created_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    status: 'em_andamento',
    mecanico_nome: 'Roberto Mecânico Chefe',
    mecanico_login: 'mecanico',
    data_inicio_atendimento: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'chm-003',
    codigo: 'CHM-1023',
    titulo: 'Travamento da correia transportadora por desalinhamento',
    equipamento: 'Esteira Transportadora Central',
    tag: 'EST-02',
    setor: 'Linha de Montagem e Embalagem',
    tipo_falha: 'mecanica',
    prioridade: 'media',
    linha_parada: false,
    descricao_problema: 'A lona da esteira correu para a borda lateral e travou no rolete guia após acúmulo de caixas.',
    operador_nome: 'Carlos Oliveira',
    operador_login: 'operador',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    status: 'encerrado',
    mecanico_nome: 'Roberto Mecânico Chefe',
    mecanico_login: 'mecanico',
    data_inicio_atendimento: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    solucao_aplicada: 'Realinhamento completo da correia, limpeza dos tambores condutores e reaperto dos esticadores laterais.',
    causa_raiz: 'Folga excessiva no tirante de esticamento decorrente de fadiga de fixação.',
    pecas_substituidas: '2x Parafusos esticadores M12x120 e 1x Rolete de apoio 60mm.',
    tempo_reparo_minutos: 45,
    data_encerramento: new Date(Date.now() - 1000 * 60 * 250).toISOString(),
    observacoes_finais: 'Equipamento testado em vazio por 15 minutos e liberado para produção em carga nominal.',
  }
];

function getLocalChamados(): Chamado[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CHAMADOS));
      return INITIAL_CHAMADOS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Falha ao ler chamados locais:', err);
    return INITIAL_CHAMADOS;
  }
}

function saveLocalChamados(chamados: Chamado[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chamados));
    // Dispara evento customizado para sincronização em tempo real na mesma aba
    window.dispatchEvent(new CustomEvent('sgc_chamados_updated', { detail: chamados }));
  } catch (err) {
    console.error('Falha ao salvar chamados locais:', err);
  }
}

// Geração de código sequencial legível
function generateCodigo(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CHM-${randomNum}`;
}

export async function carregarChamados(): Promise<Chamado[]> {
  // Se Supabase estiver conectado, busca no Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('chamados')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Atualiza cache local
        saveLocalChamados(data as Chamado[]);
        return data as Chamado[];
      } else if (!error && data && data.length === 0) {
        // Tabela existe mas está vazia, sincroniza dados iniciais
        for (const item of getLocalChamados()) {
          await supabase.from('chamados').upsert(item);
        }
        return getLocalChamados();
      }
    } catch (err) {
      console.warn('Erro ao consultar Supabase, usando armazenamento local:', err);
    }
  }

  return getLocalChamados();
}

export async function criarChamado(dados: {
  titulo: string;
  equipamento: string;
  tag: string;
  setor: string;
  tipo_falha: Chamado['tipo_falha'];
  prioridade: Chamado['prioridade'];
  linha_parada: boolean;
  descricao_problema: string;
  operador_nome: string;
  operador_login: string;
}): Promise<Chamado> {
  const novoChamado: Chamado = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `chm-${Date.now()}`,
    codigo: generateCodigo(),
    titulo: dados.titulo.trim(),
    equipamento: dados.equipamento.trim(),
    tag: dados.tag.trim().toUpperCase(),
    setor: dados.setor.trim(),
    tipo_falha: dados.tipo_falha,
    prioridade: dados.prioridade,
    linha_parada: dados.linha_parada,
    descricao_problema: dados.descricao_problema.trim(),
    operador_nome: dados.operador_nome,
    operador_login: dados.operador_login,
    status: 'aberto',
    created_at: new Date().toISOString(),
    mecanico_nome: null,
    mecanico_login: null,
    data_inicio_atendimento: null,
    solucao_aplicada: null,
    causa_raiz: null,
    pecas_substituidas: null,
    tempo_reparo_minutos: null,
    data_encerramento: null,
    observacoes_finais: null,
  };

  // Salva no Supabase se disponível
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('chamados')
        .insert([novoChamado])
        .select()
        .single();

      if (!error && data) {
        const local = getLocalChamados();
        saveLocalChamados([data as Chamado, ...local]);
        return data as Chamado;
      }
    } catch (err) {
      console.warn('Falha no insert Supabase, mantendo localmente:', err);
    }
  }

  // Fallback e atualização local
  const chamados = getLocalChamados();
  const atualizados = [novoChamado, ...chamados];
  saveLocalChamados(atualizados);
  return novoChamado;
}

export async function iniciarAtendimentoChamado(
  chamadoId: string,
  mecanico: { nome: string; login: string }
): Promise<Chamado> {
  const agora = new Date().toISOString();
  const updatePayload = {
    status: 'em_andamento' as const,
    mecanico_nome: mecanico.nome,
    mecanico_login: mecanico.login,
    data_inicio_atendimento: agora,
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('chamados')
        .update(updatePayload)
        .eq('id', chamadoId)
        .select()
        .single();

      if (!error && data) {
        const chamados = getLocalChamados().map(c => c.id === chamadoId ? (data as Chamado) : c);
        saveLocalChamados(chamados);
        return data as Chamado;
      }
    } catch (err) {
      console.warn('Erro ao atualizar atendimento no Supabase:', err);
    }
  }

  const chamados = getLocalChamados();
  const index = chamados.findIndex(c => c.id === chamadoId);
  if (index === -1) throw new Error('Chamado não encontrado');

  const atualizado: Chamado = {
    ...chamados[index],
    ...updatePayload,
  };
  chamados[index] = atualizado;
  saveLocalChamados(chamados);
  return atualizado;
}

export async function encerrarChamado(
  chamadoId: string,
  dados: {
    solucao_aplicada: string;
    causa_raiz?: string;
    pecas_substituidas?: string;
    tempo_reparo_minutos?: number;
    observacoes_finais?: string;
    mecanico_nome: string;
    mecanico_login: string;
  }
): Promise<Chamado> {
  const agora = new Date().toISOString();
  const updatePayload = {
    status: 'encerrado' as const,
    solucao_aplicada: dados.solucao_aplicada.trim(),
    causa_raiz: dados.causa_raiz?.trim() || null,
    pecas_substituidas: dados.pecas_substituidas?.trim() || null,
    tempo_reparo_minutos: dados.tempo_reparo_minutos || null,
    observacoes_finais: dados.observacoes_finais?.trim() || null,
    mecanico_nome: dados.mecanico_nome,
    mecanico_login: dados.mecanico_login,
    data_encerramento: agora,
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('chamados')
        .update(updatePayload)
        .eq('id', chamadoId)
        .select()
        .single();

      if (!error && data) {
        const chamados = getLocalChamados().map(c => c.id === chamadoId ? (data as Chamado) : c);
        saveLocalChamados(chamados);
        return data as Chamado;
      }
    } catch (err) {
      console.warn('Erro ao encerrar chamado no Supabase:', err);
    }
  }

  const chamados = getLocalChamados();
  const index = chamados.findIndex(c => c.id === chamadoId);
  if (index === -1) throw new Error('Chamado não encontrado');

  const atualizado: Chamado = {
    ...chamados[index],
    ...updatePayload,
  };
  chamados[index] = atualizado;
  saveLocalChamados(chamados);
  return atualizado;
}

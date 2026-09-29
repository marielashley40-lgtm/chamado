/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Wrench, 
  HardHat, 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { CurrentUser, Chamado, TipoFalha } from './types/ticket';
import { getStoredUser, logout as authLogout } from './lib/auth';
import { 
  carregarChamados, 
  criarChamado, 
  iniciarAtendimentoChamado, 
  encerrarChamado 
} from './lib/supabase';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { ChamadoCard } from './components/ChamadoCard';
import { NovoChamadoModal } from './components/NovoChamadoModal';
import { EncerrarChamadoModal } from './components/EncerrarChamadoModal';
import { DetalhesChamadoModal } from './components/DetalhesChamadoModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';

export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => getStoredUser());
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros e busca
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busca, setBusca] = useState('');

  // Modais
  const [isNovoChamadoOpen, setIsNovoChamadoOpen] = useState(false);
  const [chamadoParaEncerrar, setChamadoParaEncerrar] = useState<Chamado | null>(null);
  const [chamadoParaDetalhar, setChamadoParaDetalhar] = useState<Chamado | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'warning', title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Carrega chamados inicialmente
  const carregarDados = async () => {
    try {
      setRefreshing(true);
      const data = await carregarChamados();
      setChamados(data);
    } catch (err) {
      console.error('Erro ao carregar chamados:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarDados();

    // Ouvinte para atualizações instantâneas no armazenamento
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setChamados(e.detail);
      }
    };
    window.addEventListener('sgc_chamados_updated', handleUpdate);
    return () => window.removeEventListener('sgc_chamados_updated', handleUpdate);
  }, []);

  const handleLogout = () => {
    authLogout();
    setCurrentUser(null);
    addToast('info', 'Sessão encerrada', 'Você saiu do sistema de manutenção.');
  };

  // Operador abre chamado
  const handleCriarChamado = async (dados: {
    titulo: string;
    equipamento: string;
    tag: string;
    setor: string;
    tipo_falha: TipoFalha;
    prioridade: Chamado['prioridade'];
    linha_parada: boolean;
    descricao_problema: string;
  }) => {
    if (!currentUser) return;

    try {
      const novo = await criarChamado({
        ...dados,
        operador_nome: currentUser.name,
        operador_login: currentUser.username,
      });

      setChamados((prev) => [novo, ...prev]);
      addToast(
        'success',
        `Chamado ${novo.codigo} aberto com sucesso!`,
        dados.linha_parada 
          ? 'ALERTA: Linha parada comunicada à equipe de mecânica.' 
          : 'Chamado encaminhado para a fila de atendimento.'
      );
    } catch (err: any) {
      addToast('warning', 'Erro ao abrir chamado', err?.message || 'Tente novamente.');
      throw err;
    }
  };

  // Mecânico inicia atendimento
  const handleIniciarAtendimento = async (chamadoId: string) => {
    if (!currentUser) return;
    try {
      const atualizado = await iniciarAtendimentoChamado(chamadoId, {
        nome: currentUser.name,
        login: currentUser.username,
      });

      setChamados((prev) => prev.map((c) => (c.id === chamadoId ? atualizado : c)));
      addToast(
        'info',
        `Atendimento iniciado no chamado ${atualizado.codigo}`,
        `Mecânico ${currentUser.name} assumiu a ordem de serviço.`
      );
    } catch (err: any) {
      addToast('warning', 'Falha ao iniciar atendimento', err?.message);
    }
  };

  // Mecânico encerra chamado
  const handleConcluirEncerramento = async (
    chamadoId: string,
    dados: {
      solucao_aplicada: string;
      causa_raiz?: string;
      pecas_substituidas?: string;
      tempo_reparo_minutos?: number;
      observacoes_finais?: string;
    }
  ) => {
    if (!currentUser) return;
    try {
      const atualizado = await encerrarChamado(chamadoId, {
        ...dados,
        mecanico_nome: currentUser.name,
        mecanico_login: currentUser.username,
      });

      setChamados((prev) => prev.map((c) => (c.id === chamadoId ? atualizado : c)));
      addToast(
        'success',
        `Chamado ${atualizado.codigo} Encerrado!`,
        'Solução registrada e máquina liberada para a produção.'
      );
    } catch (err: any) {
      addToast('warning', 'Falha ao encerrar chamado', err?.message);
      throw err;
    }
  };

  // Filtros aplicados
  const chamadosFiltrados = useMemo(() => {
    return chamados.filter((c) => {
      // Filtro de status / linha parada
      if (filtroStatus === 'linha_parada') {
        if (!c.linha_parada || c.status === 'encerrado') return false;
      } else if (filtroStatus !== 'todos') {
        if (c.status !== filtroStatus) return false;
      }

      // Filtro de tipo de falha
      if (filtroTipo !== 'todos' && c.tipo_falha !== filtroTipo) {
        return false;
      }

      // Filtro de busca de texto
      if (busca.trim()) {
        const query = busca.toLowerCase().trim();
        const matchesCodigo = c.codigo.toLowerCase().includes(query);
        const matchesTag = c.tag.toLowerCase().includes(query);
        const matchesTitulo = c.titulo.toLowerCase().includes(query);
        const matchesEquip = c.equipamento.toLowerCase().includes(query);
        const matchesSetor = c.setor.toLowerCase().includes(query);
        const matchesDesc = c.descricao_problema.toLowerCase().includes(query);
        const matchesMecanico = (c.mecanico_nome || '').toLowerCase().includes(query);
        const matchesOperador = c.operador_nome.toLowerCase().includes(query);

        return (
          matchesCodigo ||
          matchesTag ||
          matchesTitulo ||
          matchesEquip ||
          matchesSetor ||
          matchesDesc ||
          matchesMecanico ||
          matchesOperador
        );
      }

      return true;
    });
  }, [chamados, filtroStatus, filtroTipo, busca]);

  const chamadosParadosCount = useMemo(() => {
    return chamados.filter((c) => c.linha_parada && c.status !== 'encerrado').length;
  }, [chamados]);

  // Se não estiver logado, exibe tela de login elegante
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          addToast('success', `Bem-vindo, ${user.name}!`, `Acesso concedido como ${user.role}.`);
        }}
      />
    );
  }

  const isOperador = currentUser.role === 'operador';
  const isMecanico = currentUser.role === 'mecanico';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Toast notifications */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenNovoChamado={() => setIsNovoChamadoOpen(true)}
        chamadosParadosCount={chamadosParadosCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Role Banner Guide */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`p-4 sm:p-5 rounded-2xl mb-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isOperador
              ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/30'
              : 'bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/30'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isOperador ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {isOperador ? <HardHat className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {isOperador ? 'Painel do Operador de Produção' : 'Painel da Manutenção Mecânica'}
                </h2>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                  {currentUser.cargo}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {isOperador
                  ? 'Abra novos chamados relatando sintomas observados e acompanhe a resolução em tempo real.'
                  : 'Assuma os chamados abertos, realize o reparo na máquina e encerre descrevendo a solução executada.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOperador && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsNovoChamadoOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Abrir Novo Chamado</span>
              </motion.button>
            )}

            <button
              onClick={carregarDados}
              disabled={refreshing}
              title="Atualizar lista de chamados"
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Stats Summary Cards with interactive filtering */}
        <StatsBar
          chamados={chamados}
          filtroAtual={filtroStatus}
          onSelecionarFiltro={(filtro) => setFiltroStatus(filtro)}
        />

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 mb-6 backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por código (CHM-...), tag, equipamento, setor ou operador/mecânico..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Filter Pills / Selects */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tipo:</span>
              </div>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 capitalize"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="mecanica">Mecânica</option>
                <option value="eletrica">Elétrica</option>
                <option value="hidraulica">Hidráulica</option>
                <option value="pneumatica">Pneumática</option>
                <option value="operacional">Operacional</option>
              </select>

              {/* Status Select for quick mobile access */}
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="todos">Status: Todos</option>
                <option value="aberto">Status: Abertos</option>
                <option value="em_andamento">Status: Em Reparo</option>
                <option value="encerrado">Status: Encerrados</option>
                <option value="linha_parada">Status: Linha Parada</option>
              </select>
            </div>

          </div>

          {/* Results counter & active filters tags */}
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              Exibindo <strong>{chamadosFiltrados.length}</strong> de <strong>{chamados.length}</strong> chamados
            </span>
            {(filtroStatus !== 'todos' || filtroTipo !== 'todos' || busca) && (
              <button
                onClick={() => {
                  setFiltroStatus('todos');
                  setFiltroTipo('todos');
                  setBusca('');
                }}
                className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Resetar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Tickets Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium">Carregando chamados do sistema...</p>
          </div>
        ) : chamadosFiltrados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Nenhum chamado encontrado</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              Não encontramos nenhum chamado com os filtros ou termo de busca atuais.
            </p>
            {isOperador && (
              <button
                onClick={() => setIsNovoChamadoOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Abrir Novo Chamado Agora</span>
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            layout 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {chamadosFiltrados.map((chamado) => (
                <ChamadoCard
                  key={chamado.id}
                  chamado={chamado}
                  currentUser={currentUser}
                  onIniciarAtendimento={handleIniciarAtendimento}
                  onEncerrarChamado={(c) => setChamadoParaEncerrar(c)}
                  onVerDetalhes={(c) => setChamadoParaDetalhar(c)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Modais */}
      {/* Modal do Operador - Abrir Chamado */}
      <NovoChamadoModal
        isOpen={isNovoChamadoOpen}
        onClose={() => setIsNovoChamadoOpen(false)}
        onSubmit={handleCriarChamado}
        operadorNome={currentUser.name}
      />

      {/* Modal do Mecânico - Encerrar Chamado e registrar o que foi feito */}
      <EncerrarChamadoModal
        chamado={chamadoParaEncerrar}
        isOpen={Boolean(chamadoParaEncerrar)}
        onClose={() => setChamadoParaEncerrar(null)}
        onSubmit={handleConcluirEncerramento}
        mecanicoNome={currentUser.name}
      />

      {/* Modal de Detalhes / Histórico */}
      <DetalhesChamadoModal
        chamado={chamadoParaDetalhar}
        isOpen={Boolean(chamadoParaDetalhar)}
        onClose={() => setChamadoParaDetalhar(null)}
        currentUser={currentUser}
        onIniciarAtendimento={handleIniciarAtendimento}
        onEncerrarChamado={(c) => {
          setChamadoParaDetalhar(null);
          setChamadoParaEncerrar(c);
        }}
      />
    </div>
  );
}

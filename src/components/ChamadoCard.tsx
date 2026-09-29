import React from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  User, 
  Tag, 
  MapPin, 
  ArrowRight, 
  Calendar,
  Check,
  ChevronRight,
  Package,
  Activity,
  FileCheck
} from 'lucide-react';
import { Chamado, CurrentUser } from '../types/ticket';

interface ChamadoCardProps {
  chamado: Chamado;
  currentUser: CurrentUser;
  onIniciarAtendimento: (chamadoId: string) => void;
  onEncerrarChamado: (chamado: Chamado) => void;
  onVerDetalhes: (chamado: Chamado) => void;
}

export const ChamadoCard: React.FC<ChamadoCardProps> = ({
  chamado,
  currentUser,
  onIniciarAtendimento,
  onEncerrarChamado,
  onVerDetalhes,
}) => {
  const isMecanico = currentUser.role === 'mecanico';
  const isOperador = currentUser.role === 'operador';

  const formatData = (isoStr: string) => {
    try {
      const data = new Date(isoStr);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const getTipoFalhaBadge = (tipo: string) => {
    const tiposMap: Record<string, { label: string; color: string }> = {
      mecanica: { label: 'Mecânica', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
      eletrica: { label: 'Elétrica', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
      hidraulica: { label: 'Hidráulica', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
      pneumatica: { label: 'Pneumática', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
      operacional: { label: 'Operacional', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
      outros: { label: 'Geral', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
    };
    const t = tiposMap[tipo] || tiposMap.outros;
    return (
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${t.color}`}>
        {t.label}
      </span>
    );
  };

  const getPrioridadeBadge = (p: string) => {
    switch (p) {
      case 'critica':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Crítica
          </span>
        );
      case 'alta':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
            Alta
          </span>
        );
      case 'media':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            Média
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 border border-slate-600">
            Baixa
          </span>
        );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border transition-all duration-200 overflow-hidden relative ${
        chamado.status === 'aberto'
          ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40 shadow-lg'
          : chamado.status === 'em_andamento'
          ? 'bg-slate-900/90 border-blue-900/50 hover:border-blue-500/50 shadow-lg shadow-blue-950/20'
          : 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/30 opacity-95'
      }`}
    >
      {/* Indicator line on top */}
      <div className={`h-1 w-full ${
        chamado.status === 'aberto'
          ? 'bg-amber-500'
          : chamado.status === 'em_andamento'
          ? 'bg-blue-500'
          : 'bg-emerald-500'
      }`} />

      <div className="p-4 sm:p-5">
        {/* Header row: Codigo, Tags, Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-sm text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {chamado.codigo}
            </span>
            <span className="font-mono font-bold text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              {chamado.tag}
            </span>
            {chamado.linha_parada && (
              <motion.span 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-red-500 text-slate-950 flex items-center gap-1 shadow-sm shadow-red-500/30"
              >
                <Flame className="w-3 h-3 fill-slate-950" />
                PARADA
              </motion.span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {getTipoFalhaBadge(chamado.tipo_falha)}
            {getPrioridadeBadge(chamado.prioridade)}

            {/* Status pill */}
            {chamado.status === 'aberto' && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <Clock className="w-3 h-3 animate-spin" />
                Aberto
              </span>
            )}
            {chamado.status === 'em_andamento' && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <Wrench className="w-3 h-3" />
                Em Reparo
              </span>
            )}
            {chamado.status === 'encerrado' && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                Encerrado
              </span>
            )}
          </div>
        </div>

        {/* Equipamento & Título */}
        <div className="mb-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <span className="font-semibold text-slate-300">{chamado.equipamento}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {chamado.setor}
            </span>
          </div>
          <h3 className="text-base font-bold text-white leading-snug">
            {chamado.titulo}
          </h3>
        </div>

        {/* Descrição do Operador */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1 font-semibold text-[11px]">
            <User className="w-3 h-3 text-amber-400" />
            <span>Relato do Operador ({chamado.operador_nome}):</span>
          </div>
          <p className="line-clamp-2 text-slate-300 leading-relaxed">
            {chamado.descricao_problema}
          </p>
        </div>

        {/* Detalhes do Mecânico se Encerrado ou Em Andamento */}
        {chamado.status === 'em_andamento' && chamado.mecanico_nome && (
          <div className="bg-blue-950/30 border border-blue-800/40 p-3 rounded-xl mb-3 text-xs">
            <div className="flex items-center justify-between text-blue-300 font-semibold mb-0.5">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
                Atendimento iniciado por {chamado.mecanico_nome}
              </span>
              {chamado.data_inicio_atendimento && (
                <span className="font-mono text-[11px] text-blue-400/80">
                  {formatData(chamado.data_inicio_atendimento)}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-[11px]">
              O mecânico está no local trabalhando no diagnóstico e correção da falha.
            </p>
          </div>
        )}

        {chamado.status === 'encerrado' && (
          <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl mb-3 text-xs">
            <div className="flex items-center justify-between text-emerald-300 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Solução Aplicada por {chamado.mecanico_nome || 'Mecânico'}:
              </span>
              {chamado.tempo_reparo_minutos && (
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {chamado.tempo_reparo_minutos} min
                </span>
              )}
            </div>
            <p className="text-slate-200 line-clamp-2 font-medium">
              {chamado.solucao_aplicada}
            </p>
            {chamado.pecas_substituidas && (
              <div className="mt-1.5 pt-1.5 border-t border-emerald-900/40 flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-mono">
                <Package className="w-3 h-3" />
                <span>Peças: {chamado.pecas_substituidas}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer: timestamps & action buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>Aberto: {formatData(chamado.created_at)}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão Ver Detalhes */}
            <button
              onClick={() => onVerDetalhes(chamado)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Detalhes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Ações específicas do Mecânico */}
            {isMecanico && chamado.status === 'aberto' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onIniciarAtendimento(chamado.id)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Iniciar Atendimento</span>
              </motion.button>
            )}

            {isMecanico && chamado.status === 'em_andamento' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onEncerrarChamado(chamado)}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Encerrar Chamado</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

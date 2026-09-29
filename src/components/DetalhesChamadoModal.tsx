import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  User, 
  Tag, 
  MapPin, 
  Package, 
  FileText, 
  Calendar,
  Layers,
  ArrowRight,
  HardHat
} from 'lucide-react';
import { Chamado, CurrentUser } from '../types/ticket';

interface DetalhesChamadoModalProps {
  chamado: Chamado | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  onIniciarAtendimento?: (chamadoId: string) => void;
  onEncerrarChamado?: (chamado: Chamado) => void;
}

export const DetalhesChamadoModal: React.FC<DetalhesChamadoModalProps> = ({
  chamado,
  isOpen,
  onClose,
  currentUser,
  onIniciarAtendimento,
  onEncerrarChamado,
}) => {
  if (!isOpen || !chamado) return null;

  const isMecanico = currentUser.role === 'mecanico';

  const formatData = (isoStr?: string | null) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden my-6 z-10"
        >
          {/* Top highlight bar */}
          <div className={`h-1.5 w-full ${
            chamado.status === 'aberto'
              ? 'bg-amber-500'
              : chamado.status === 'em_andamento'
              ? 'bg-blue-500'
              : 'bg-emerald-500'
          }`} />

          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-white text-xs">
                {chamado.tag}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-white text-base">
                    {chamado.codigo}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    chamado.status === 'aberto'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : chamado.status === 'em_andamento'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {chamado.status === 'aberto' ? 'Aguardando Atendimento' : chamado.status === 'em_andamento' ? 'Em Manutenção' : 'Encerrado / Resolvido'}
                  </span>
                  {chamado.linha_parada && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500 text-slate-950 flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-slate-950" />
                      LINHA PARADA
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {chamado.equipamento} &bull; {chamado.setor}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Título */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Título do Chamado
              </span>
              <h3 className="text-lg font-bold text-white">{chamado.titulo}</h3>
            </div>

            {/* Grid de Informações Técnicas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Tipo de Falha</span>
                <span className="font-semibold text-white capitalize">{chamado.tipo_falha}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Prioridade</span>
                <span className="font-semibold text-white capitalize">{chamado.prioridade}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Linha Parada?</span>
                <span className={`font-semibold ${chamado.linha_parada ? 'text-red-400' : 'text-emerald-400'}`}>
                  {chamado.linha_parada ? 'Sim (Crítico)' : 'Não'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Tempo de Reparo</span>
                <span className="font-semibold text-white">
                  {chamado.tempo_reparo_minutos ? `${chamado.tempo_reparo_minutos} min` : '-'}
                </span>
              </div>
            </div>

            {/* Descrição do Operador */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <HardHat className="w-4 h-4" />
                  Registro de Abertura pelo Operador
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {formatData(chamado.created_at)}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {chamado.descricao_problema}
              </p>
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Operador solicitante: <strong className="text-slate-300">{chamado.operador_nome}</strong></span>
              </div>
            </div>

            {/* Laudo do Mecânico (se houver) */}
            {(chamado.solucao_aplicada || chamado.status !== 'aberto') && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Wrench className="w-4 h-4" />
                    Intervenção Técnica da Manutenção
                  </span>
                  {chamado.data_encerramento && (
                    <span className="text-[11px] font-mono text-slate-500">
                      Concluído: {formatData(chamado.data_encerramento)}
                    </span>
                  )}
                </div>

                {chamado.status === 'em_andamento' && !chamado.solucao_aplicada && (
                  <p className="text-sm text-blue-300 font-medium">
                    Atendimento iniciado por {chamado.mecanico_nome} em {formatData(chamado.data_inicio_atendimento)}. Aguardando conclusão dos serviços mecânicos.
                  </p>
                )}

                {chamado.solucao_aplicada && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold mb-0.5">
                        Solução Executada:
                      </span>
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                        {chamado.solucao_aplicada}
                      </p>
                    </div>

                    {chamado.causa_raiz && (
                      <div>
                        <span className="text-xs text-slate-400 block font-semibold mb-0.5">
                          Causa Raiz Identificada:
                        </span>
                        <p className="text-sm text-cyan-300">
                          {chamado.causa_raiz}
                        </p>
                      </div>
                    )}

                    {chamado.pecas_substituidas && (
                      <div>
                        <span className="text-xs text-slate-400 block font-semibold mb-0.5">
                          Peças / Componentes Substituídos:
                        </span>
                        <p className="text-sm text-amber-300 font-mono">
                          {chamado.pecas_substituidas}
                        </p>
                      </div>
                    )}

                    {chamado.observacoes_finais && (
                      <div>
                        <span className="text-xs text-slate-400 block font-semibold mb-0.5">
                          Observações & Recomendações:
                        </span>
                        <p className="text-sm text-slate-300">
                          {chamado.observacoes_finais}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-blue-400" />
                        <span>Mecânico responsável: <strong className="text-slate-300">{chamado.mecanico_nome}</strong></span>
                      </div>
                      {chamado.tempo_reparo_minutos && (
                        <span className="font-mono text-emerald-400 font-semibold">
                          Tempo total: {chamado.tempo_reparo_minutos} min
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors cursor-pointer"
            >
              Fechar
            </button>

            {isMecanico && chamado.status === 'aberto' && onIniciarAtendimento && (
              <button
                onClick={() => {
                  onIniciarAtendimento(chamado.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Wrench className="w-4 h-4" />
                <span>Iniciar Atendimento</span>
              </button>
            )}

            {isMecanico && chamado.status === 'em_andamento' && onEncerrarChamado && (
              <button
                onClick={() => {
                  onClose();
                  onEncerrarChamado(chamado);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Encerrar Chamado Agora</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

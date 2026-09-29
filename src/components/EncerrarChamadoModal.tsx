import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  FileText, 
  Package, 
  Search, 
  AlertCircle,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Chamado } from '../types/ticket';

interface EncerrarChamadoModalProps {
  chamado: Chamado | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (chamadoId: string, dados: {
    solucao_aplicada: string;
    causa_raiz?: string;
    pecas_substituidas?: string;
    tempo_reparo_minutos?: number;
    observacoes_finais?: string;
  }) => Promise<void>;
  mecanicoNome: string;
}

export const EncerrarChamadoModal: React.FC<EncerrarChamadoModalProps> = ({
  chamado,
  isOpen,
  onClose,
  onSubmit,
  mecanicoNome,
}) => {
  const [solucao, setSolucao] = useState('');
  const [causaRaiz, setCausaRaiz] = useState('');
  const [pecas, setPecas] = useState('');
  const [tempoMinutos, setTempoMinutos] = useState<number>(30);
  const [observacoes, setObservacoes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !chamado) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solucao.trim()) {
      setErrorMsg('Descreva detalhadamente a solução aplicada pelo mecânico.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      await onSubmit(chamado.id, {
        solucao_aplicada: solucao.trim(),
        causa_raiz: causaRaiz.trim() || undefined,
        pecas_substituidas: pecas.trim() || undefined,
        tempo_reparo_minutos: Number(tempoMinutos) || 30,
        observacoes_finais: observacoes.trim() || undefined,
      });

      // Confetti celebration animation
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ffffff'],
      });

      setSolucao('');
      setCausaRaiz('');
      setPecas('');
      setObservacoes('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao encerrar chamado.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden my-6 z-10"
        >
          {/* Top highlight bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>Encerramento de Chamado</span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {chamado.codigo}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Mecânico Responsável: <strong className="text-slate-300">{mecanicoNome}</strong>
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

          {/* Chamado Context Preview */}
          <div className="bg-slate-950/70 p-4 border-b border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white font-mono">{chamado.tag}</span>
                <span>&bull;</span>
                <span className="text-slate-300">{chamado.equipamento}</span>
                <span>&bull;</span>
                <span className="text-slate-400">{chamado.setor}</span>
              </div>
              <span className="text-slate-400">
                Aberto por: <strong className="text-slate-300">{chamado.operador_nome}</strong>
              </span>
            </div>
            <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <strong className="text-amber-400 block mb-0.5">Problema Relatado:</strong>
              {chamado.descricao_problema}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* O Que Foi Feito (Solução) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Descrição da Solução / O Que Foi Feito *</span>
              </label>
              <textarea
                rows={3}
                value={solucao}
                onChange={(e) => setSolucao(e.target.value)}
                placeholder="Descreva em detalhes o procedimento executado pelo mecânico: reparo elétrico/mecânico, regulagens, reaperto, testes efetuados..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                required
              />
            </div>

            {/* Causa Raiz e Peças */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Causa Raiz Identificada</span>
                </label>
                <input
                  type="text"
                  value={causaRaiz}
                  onChange={(e) => setCausaRaiz(e.target.value)}
                  placeholder="Ex: Fadiga mecânica, folga de fixação, vazamento de retentor"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tempo de Reparo (minutos)</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  step="5"
                  value={tempoMinutos}
                  onChange={(e) => setTempoMinutos(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Peças / Componentes Substituídos */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                <span>Peças ou Componentes Substituídos</span>
              </label>
              <input
                type="text"
                value={pecas}
                onChange={(e) => setPecas(e.target.value)}
                placeholder="Ex: 1x Rolamento SKF 6205, 2x Parafusos M12, 10L Óleo Hidráulico ISO VG 68"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Observações e Recomendações */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Observações Finais & Recomendações Preventivas
              </label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Máquina testada e liberada para o operador. Monitorar vibração no próximo turno."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold text-sm transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Concluir e Encerrar Chamado</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

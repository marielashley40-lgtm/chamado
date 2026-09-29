import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  AlertTriangle, 
  Send, 
  Flame, 
  Tag, 
  MapPin, 
  Wrench, 
  Cpu, 
  Droplet, 
  Wind, 
  Settings,
  Sparkles,
  HardHat
} from 'lucide-react';
import { Chamado, Prioridade, TipoFalha } from '../types/ticket';

interface NovoChamadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dados: {
    titulo: string;
    equipamento: string;
    tag: string;
    setor: string;
    tipo_falha: TipoFalha;
    prioridade: Prioridade;
    linha_parada: boolean;
    descricao_problema: string;
  }) => Promise<void>;
  operadorNome: string;
}

const PRESET_EQUIPAMENTOS = [
  { nome: 'Injetora Romi 350T', tag: 'INJ-04', setor: 'Injeção Plástica', tipo: 'hidraulica' as TipoFalha },
  { nome: 'Torno CNC Mazak 250', tag: 'CNC-08', setor: 'Usinagem de Precisão', tipo: 'mecanica' as TipoFalha },
  { nome: 'Prensa Hidráulica 200T', tag: 'PRS-02', setor: 'Estamparia & Conformação', tipo: 'hidraulica' as TipoFalha },
  { nome: 'Centro de Usinagem Romi D800', tag: 'CTU-01', setor: 'Usinagem de Precisão', tipo: 'eletrica' as TipoFalha },
  { nome: 'Compressor Parafuso Schulz', tag: 'CMP-03', setor: 'Utilidades & Ar Comprimido', tipo: 'pneumatica' as TipoFalha },
  { nome: 'Ponte Rolante 10 Toneladas', tag: 'PRL-01', setor: 'Caldeiraria & Cargas', tipo: 'mecanica' as TipoFalha },
];

export const NovoChamadoModal: React.FC<NovoChamadoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  operadorNome,
}) => {
  const [titulo, setTitulo] = useState('');
  const [equipamento, setEquipamento] = useState('');
  const [tag, setTag] = useState('');
  const [setor, setSetor] = useState('Usinagem de Precisão');
  const [tipoFalha, setTipoFalha] = useState<TipoFalha>('mecanica');
  const [prioridade, setPrioridade] = useState<Prioridade>('alta');
  const [linhaParada, setLinhaParada] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_EQUIPAMENTOS[0]) => {
    setEquipamento(preset.nome);
    setTag(preset.tag);
    setSetor(preset.setor);
    setTipoFalha(preset.tipo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !equipamento.trim() || !tag.trim() || !descricao.trim()) {
      setErrorMsg('Preencha todos os campos obrigatórios (Título, Equipamento, Tag e Descrição).');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await onSubmit({
        titulo: titulo.trim(),
        equipamento: equipamento.trim(),
        tag: tag.trim().toUpperCase(),
        setor: setor.trim(),
        tipo_falha: tipoFalha,
        prioridade,
        linha_parada: linhaParada,
        descricao_problema: descricao.trim(),
      });
      // Limpa os campos
      setTitulo('');
      setEquipamento('');
      setTag('');
      setDescricao('');
      setLinhaParada(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ocorreu um erro ao abrir o chamado.');
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
          <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <HardHat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>Abertura de Chamado</span>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Operador
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Responsável pelo registro: <strong className="text-slate-300">{operadorNome}</strong>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Sugestões rápidas de maquinário */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Seleção Rápida de Equipamento:</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_EQUIPAMENTOS.map((p) => (
                  <button
                    key={p.tag}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="font-mono text-amber-400 font-bold">{p.tag}</span>
                    <span>{p.nome}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Linha Parada Toggle Switcher */}
            <div className={`p-4 rounded-xl border transition-all ${
              linhaParada 
                ? 'bg-red-950/40 border-red-500/60 ring-2 ring-red-500/20' 
                : 'bg-slate-950/40 border-slate-800'
            }`}>
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setLinhaParada(!linhaParada)}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    linhaParada ? 'bg-red-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Equipamento / Linha Parada?</span>
                      {linhaParada && (
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-500 text-slate-950">
                          CRÍTICO
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Marque caso a parada esteja interrompendo a produção imediatamente.
                    </p>
                  </div>
                </div>

                <div className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                  linhaParada ? 'bg-red-500 justify-end' : 'bg-slate-700 justify-start'
                }`}>
                  <motion.div 
                    layout
                    className="w-4 h-4 rounded-full bg-white shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* Título do Chamado */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Título Resumido da Ocorrência *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Aquecimento excessivo no mancal do cabeçote"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Equipamento, Tag & Setor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Equipamento *
                </label>
                <input
                  type="text"
                  value={equipamento}
                  onChange={(e) => setEquipamento(e.target.value)}
                  placeholder="Ex: Torno CNC Mazak"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tag / ID Máquina *
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Ex: CNC-08"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Setor / Linha *
                </label>
                <select
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Usinagem de Precisão">Usinagem de Precisão</option>
                  <option value="Injeção Plástica">Injeção Plástica</option>
                  <option value="Estamparia & Conformação">Estamparia & Conformação</option>
                  <option value="Linha de Montagem">Linha de Montagem</option>
                  <option value="Caldeiraria & Solda">Caldeiraria & Solda</option>
                  <option value="Utilidades & Compressores">Utilidades & Compressores</option>
                  <option value="Expedição & Logística">Expedição & Logística</option>
                </select>
              </div>
            </div>

            {/* Tipo de Falha & Prioridade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tipo de Falha
                </label>
                <select
                  value={tipoFalha}
                  onChange={(e) => setTipoFalha(e.target.value as TipoFalha)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 capitalize"
                >
                  <option value="mecanica">Mecânica</option>
                  <option value="eletrica">Elétrica</option>
                  <option value="hidraulica">Hidráulica</option>
                  <option value="pneumatica">Pneumática</option>
                  <option value="operacional">Operacional</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Grau de Urgência
                </label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 capitalize"
                >
                  <option value="baixa">Baixa (Pode aguardar)</option>
                  <option value="media">Média (Atenção necessária)</option>
                  <option value="alta">Alta (Impacta produção)</option>
                  <option value="critica">Crítica (Imediato / Risco)</option>
                </select>
              </div>
            </div>

            {/* Descrição Detalhada */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Descrição Detalhada do Problema Observado *
              </label>
              <textarea
                rows={4}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva detalhadamente o sintoma: ruídos anormais, mensagens de erro no visor, vazamentos, cheiro de queimado, oscilação de pressão ou qualquer observação relevante para o mecânico..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                required
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Forneça o máximo de detalhes para agilizar o diagnóstico e reparo pela equipe de manutenção.
              </span>
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
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Registrar e Enviar Chamado</span>
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

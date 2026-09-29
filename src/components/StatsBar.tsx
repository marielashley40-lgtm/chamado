import React from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Flame,
  Wrench
} from 'lucide-react';
import { Chamado } from '../types/ticket';

interface StatsBarProps {
  chamados: Chamado[];
  filtroAtual: string;
  onSelecionarFiltro: (filtro: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  chamados,
  filtroAtual,
  onSelecionarFiltro,
}) => {
  const total = chamados.length;
  const abertos = chamados.filter((c) => c.status === 'aberto').length;
  const emAndamento = chamados.filter((c) => c.status === 'em_andamento').length;
  const encerrados = chamados.filter((c) => c.status === 'encerrado').length;
  const linhaParada = chamados.filter((c) => c.linha_parada && c.status !== 'encerrado').length;

  const cards = [
    {
      id: 'todos',
      label: 'Total Geral',
      count: total,
      icon: Layers,
      color: 'slate',
      bgGlow: 'hover:border-slate-600',
      activeRing: 'border-slate-500 bg-slate-800/80',
      iconColor: 'text-slate-400',
    },
    {
      id: 'aberto',
      label: 'Aguardando',
      count: abertos,
      icon: Clock,
      color: 'amber',
      bgGlow: 'hover:border-amber-500/50',
      activeRing: 'border-amber-500 bg-amber-500/10 text-amber-300',
      iconColor: 'text-amber-400',
      alert: abertos > 0,
    },
    {
      id: 'em_andamento',
      label: 'Em Reparo',
      count: emAndamento,
      icon: Wrench,
      color: 'blue',
      bgGlow: 'hover:border-blue-500/50',
      activeRing: 'border-blue-500 bg-blue-500/10 text-blue-300',
      iconColor: 'text-blue-400',
    },
    {
      id: 'encerrado',
      label: 'Solucionados',
      count: encerrados,
      icon: CheckCircle2,
      color: 'emerald',
      bgGlow: 'hover:border-emerald-500/50',
      activeRing: 'border-emerald-500 bg-emerald-500/10 text-emerald-300',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'linha_parada',
      label: 'Linha Parada',
      count: linhaParada,
      icon: Flame,
      color: 'red',
      bgGlow: 'hover:border-red-500/50',
      activeRing: 'border-red-500 bg-red-500/10 text-red-300',
      iconColor: 'text-red-400',
      urgent: linhaParada > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        const isActive = filtroAtual === card.id;

        return (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelecionarFiltro(card.id)}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden backdrop-blur-sm ${
              isActive
                ? card.activeRing
                : `bg-slate-900/60 border-slate-800 ${card.bgGlow} text-slate-300`
            }`}
          >
            {card.urgent && (
              <div className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <IconComponent className={`w-4 h-4 ${card.iconColor}`} />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {card.count}
              </span>
              {card.id === 'encerrado' && total > 0 && (
                <span className="text-[11px] text-emerald-400 font-mono">
                  {Math.round((encerrados / total) * 100)}%
                </span>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

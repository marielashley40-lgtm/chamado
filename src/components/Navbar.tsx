import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Factory, 
  LogOut, 
  HardHat, 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Activity,
  Flame
} from 'lucide-react';
import { CurrentUser } from '../types/ticket';

interface NavbarProps {
  currentUser: CurrentUser;
  onLogout: () => void;
  onOpenNovoChamado?: () => void;
  chamadosParadosCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onOpenNovoChamado,
  chamadosParadosCount,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isOperador = currentUser.role === 'operador';

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">SGC</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold border border-slate-700">
                  Manutenção
                </span>
                {chamadosParadosCount > 0 && (
                  <motion.span 
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-500/40"
                  >
                    <Flame className="w-3 h-3 text-red-500 fill-red-500" />
                    <span>{chamadosParadosCount} {chamadosParadosCount === 1 ? 'Parada' : 'Paradas'}</span>
                  </motion.span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Gestão e Monitoramento de Ordem de Serviço
              </p>
            </div>
          </div>

          {/* Center Info / Real-time clock */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Planta Operacional Ativa</span>
            </div>
            <div className="w-px h-3.5 bg-slate-800" />
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{timeStr || 'Horário de Brasília'}</span>
            </div>
          </div>

          {/* Right actions & User profile */}
          <div className="flex items-center gap-3">
            {isOperador && onOpenNovoChamado && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenNovoChamado}
                className="flex items-center gap-2 py-2 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Abrir Chamado</span>
              </motion.button>
            )}

            {/* User profile capsule */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-800">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-md ${
                isOperador
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950'
                  : 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white'
              }`}>
                {isOperador ? <HardHat className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${isOperador ? 'bg-amber-400' : 'bg-blue-400'}`} />
                  <span className="capitalize font-medium">{currentUser.role}</span>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={onLogout}
                title="Encerrar Sessão"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

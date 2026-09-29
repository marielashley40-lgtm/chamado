export type Prioridade = 'baixa' | 'media' | 'alta' | 'critica';
export type StatusChamado = 'aberto' | 'em_andamento' | 'encerrado';
export type TipoFalha = 'mecanica' | 'eletrica' | 'hidraulica' | 'pneumatica' | 'operacional' | 'outros';

export interface Chamado {
  id: string;
  codigo: string; // Ex: CHM-2026-001
  titulo: string;
  equipamento: string;
  tag: string;
  setor: string;
  tipo_falha: TipoFalha;
  prioridade: Prioridade;
  linha_parada: boolean;
  descricao_problema: string;
  operador_nome: string;
  operador_login: string;
  created_at: string;
  status: StatusChamado;

  // Campos do Mecânico
  mecanico_nome?: string | null;
  mecanico_login?: string | null;
  data_inicio_atendimento?: string | null;
  solucao_aplicada?: string | null;
  causa_raiz?: string | null;
  pecas_substituidas?: string | null;
  tempo_reparo_minutos?: number | null;
  data_encerramento?: string | null;
  observacoes_finais?: string | null;
}

export type UserRole = 'operador' | 'mecanico';

export interface CurrentUser {
  username: string;
  name: string;
  role: UserRole;
  cargo: string;
  avatarBg: string;
}

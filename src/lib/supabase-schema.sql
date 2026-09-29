-- =======================================================
-- SGC - Sistema de Gestão de Chamados Industriais
-- Script SQL para criar a tabela no Supabase
-- Execute este script no SQL Editor do seu painel Supabase
-- =======================================================

create table if not exists public.chamados (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  titulo text not null,
  equipamento text not null,
  tag text not null,
  setor text not null,
  tipo_falha text not null check (tipo_falha in ('mecanica', 'eletrica', 'hidraulica', 'pneumatica', 'operacional', 'outros')),
  prioridade text not null check (prioridade in ('baixa', 'media', 'alta', 'critica')),
  linha_parada boolean default false,
  descricao_problema text not null,
  operador_nome text not null,
  operador_login text not null default 'operador',
  status text not null default 'aberto' check (status in ('aberto', 'em_andamento', 'encerrado')),
  mecanico_nome text,
  mecanico_login text,
  data_inicio_atendimento timestamptz,
  solucao_aplicada text,
  causa_raiz text,
  pecas_substituidas text,
  tempo_reparo_minutos integer,
  data_encerramento timestamptz,
  observacoes_finais text,
  created_at timestamptz default now() not null
);

-- Habilitar RLS (Row Level Security) e permitir acesso público para leitura/escrita
alter table public.chamados enable row level security;

create policy "Permitir leitura pública de chamados" 
on public.chamados for select 
using (true);

create policy "Permitir inserção de chamados" 
on public.chamados for insert 
with check (true);

create policy "Permitir atualização de chamados" 
on public.chamados for update 
using (true);

-- Índices para melhor performance de busca
create index if not exists idx_chamados_status on public.chamados(status);
create index if not exists idx_chamados_prioridade on public.chamados(prioridade);
create index if not exists idx_chamados_created_at on public.chamados(created_at desc);

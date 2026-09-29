-- ==============================================================================
-- SGC - SISTEMA DE GESTÃO DE CHAMADOS DE MANUTENÇÃO
-- SCRIPT SQL COMPLETO (CORRIGIDO PARA O SUPABASE)
-- ==============================================================================
-- Instruções:
-- 1. Acesse o painel do seu projeto no Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral, clique em "SQL Editor"
-- 3. Cole este script completo e clique em "RUN"
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABELA PRINCIPAL: CHAMADOS
-- ------------------------------------------------------------------------------
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
  foto_url text,
  anexos jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ------------------------------------------------------------------------------
-- 2. ÍNDICES DE PERFORMANCE
-- ------------------------------------------------------------------------------
create index if not exists idx_chamados_status on public.chamados(status);
create index if not exists idx_chamados_prioridade on public.chamados(prioridade);
create index if not exists idx_chamados_linha_parada on public.chamados(linha_parada);
create index if not exists idx_chamados_created_at on public.chamados(created_at desc);
create index if not exists idx_chamados_tag on public.chamados(tag);

-- ------------------------------------------------------------------------------
-- 3. TRIGGER AUTOMÁTICO PARA ATUALIZAÇÃO DO CAMPO updated_at
-- ------------------------------------------------------------------------------
create or replace function public.atualizar_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_atualizar_chamados_updated_at on public.chamados;
create trigger trigger_atualizar_chamados_updated_at
before update on public.chamados
for each row
execute function public.atualizar_updated_at();

-- ------------------------------------------------------------------------------
-- 4. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) NA TABELA DE CHAMADOS
-- ------------------------------------------------------------------------------
alter table public.chamados enable row level security;

-- Limpar políticas anteriores se existirem
drop policy if exists "Permitir leitura pública de chamados" on public.chamados;
drop policy if exists "Permitir inserção de chamados" on public.chamados;
drop policy if exists "Permitir atualização de chamados" on public.chamados;
drop policy if exists "Permitir exclusão de chamados" on public.chamados;
drop policy if exists "Permitir leitura de chamados" on public.chamados;
drop policy if exists "Permitir abertura de chamados" on public.chamados;

-- Política 1: Leitura de chamados (SELECT)
create policy "Permitir leitura de chamados"
on public.chamados
for select
to public, anon, authenticated
using (true);

-- Política 2: Abertura de chamados pelo operador (INSERT)
create policy "Permitir abertura de chamados"
on public.chamados
for insert
to public, anon, authenticated
with check (true);

-- Política 3: Atendimento e encerramento de chamados pelo mecânico (UPDATE)
create policy "Permitir atualização de chamados"
on public.chamados
for update
to public, anon, authenticated
using (true)
with check (true);

-- Política 4: Exclusão de chamados (DELETE)
create policy "Permitir exclusão de chamados"
on public.chamados
for delete
to public, anon, authenticated
using (true);

-- Permissões de acesso
grant all on public.chamados to anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 5. BUCKET DE ARMAZENAMENTO (STORAGE)
-- ------------------------------------------------------------------------------
-- Cria o bucket "chamados" caso ainda não exista
insert into storage.buckets (id, name, public)
values ('chamados', 'chamados', true)
on conflict (id) do nothing;

-- ------------------------------------------------------------------------------
-- 6. POLÍTICAS DE ARMAZENAMENTO (STORAGE POLICIES)
-- (Nota: storage.objects já possui RLS nativamente ativado pelo Supabase)
-- ------------------------------------------------------------------------------
drop policy if exists "Permitir visualização pública de arquivos de chamados" on storage.objects;
drop policy if exists "Permitir upload de arquivos de chamados" on storage.objects;
drop policy if exists "Permitir atualização de arquivos de chamados" on storage.objects;
drop policy if exists "Permitir exclusão de arquivos de chamados" on storage.objects;

-- Leitura pública dos arquivos do bucket chamados
create policy "Permitir visualização pública de arquivos de chamados"
on storage.objects
for select
to public, anon, authenticated
using (bucket_id = 'chamados');

-- Envio de arquivos no bucket chamados
create policy "Permitir upload de arquivos de chamados"
on storage.objects
for insert
to public, anon, authenticated
with check (bucket_id = 'chamados');

-- Atualização de arquivos no bucket chamados
create policy "Permitir atualização de arquivos de chamados"
on storage.objects
for update
to public, anon, authenticated
using (bucket_id = 'chamados')
with check (bucket_id = 'chamados');

-- Exclusão de arquivos no bucket chamados
create policy "Permitir exclusão de arquivos de chamados"
on storage.objects
for delete
to public, anon, authenticated
using (bucket_id = 'chamados');

-- ------------------------------------------------------------------------------
-- 7. SINCRONIZAÇÃO EM TEMPO REAL (REALTIME)
-- ------------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'chamados'
  ) then
    alter publication supabase_realtime add table public.chamados;
  end if;
end;
$$;

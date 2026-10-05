create table public.duels (
    id uuid primary key default gen_random_uuid(),
    code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
    mode text not null check (char_length(mode) <= 20),
    kind text not null default 'async' check (kind in ('async', 'live')),
    rounds jsonb not null check (jsonb_typeof(rounds) = 'array' and jsonb_array_length(rounds) between 1 and 10),
    created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
    creator_name text not null check (char_length(creator_name) between 1 and 50),
    created_at timestamptz not null default now(),
    expires_at timestamptz not null default now() + interval '7 days'
);

create index duels_created_by_idx on public.duels (created_by, created_at desc);

alter table public.duels enable row level security;

create policy "Usuários logados veem duelos"
    on public.duels for select to authenticated
    using (true);

create policy "Usuário cria os próprios duelos"
    on public.duels for insert to authenticated
    with check ((select auth.uid()) = created_by);

create policy "Criador apaga o duelo"
    on public.duels for delete to authenticated
    using ((select auth.uid()) = created_by);

create table public.duel_results (
    duel_id uuid not null references public.duels (id) on delete cascade,
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    player_name text not null check (char_length(player_name) between 1 and 50),
    rounds jsonb not null check (jsonb_typeof(rounds) = 'array' and jsonb_array_length(rounds) <= 10),
    score integer not null check (score between 0 and 10000),
    finished_at timestamptz not null default now(),
    primary key (duel_id, user_id)
);

create index duel_results_user_idx on public.duel_results (user_id, finished_at desc);

alter table public.duel_results enable row level security;

create policy "Usuários logados veem resultados"
    on public.duel_results for select to authenticated
    using (true);

create policy "Usuário registra o próprio resultado uma vez"
    on public.duel_results for insert to authenticated
    with check (
        (select auth.uid()) = user_id
        and exists (
            select 1 from public.duels
            where duels.id = duel_results.duel_id and duels.expires_at > now()
        )
    );

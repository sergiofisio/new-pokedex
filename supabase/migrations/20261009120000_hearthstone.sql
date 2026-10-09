create table public.hs_collection (
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    dbf_id integer not null check (dbf_id > 0),
    count smallint not null check (count between 0 and 2),
    premium smallint not null default 0 check (premium between 0 and 2),
    updated_at timestamptz not null default now(),
    primary key (user_id, dbf_id)
);

alter table public.hs_collection enable row level security;

create policy "Usuário lê a própria coleção"
    on public.hs_collection for select
    using ((select auth.uid()) = user_id);

create policy "Usuário adiciona à própria coleção"
    on public.hs_collection for insert
    with check ((select auth.uid()) = user_id);

create policy "Usuário atualiza a própria coleção"
    on public.hs_collection for update
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Usuário remove da própria coleção"
    on public.hs_collection for delete
    using ((select auth.uid()) = user_id);

create table public.hs_decks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    name text not null check (char_length(name) between 1 and 60),
    class text not null check (char_length(class) <= 20),
    format text not null check (format in ('standard', 'wild')),
    code text not null check (char_length(code) <= 400),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index hs_decks_user_id_idx on public.hs_decks (user_id, updated_at desc);

alter table public.hs_decks enable row level security;

create policy "Usuário lê os próprios decks"
    on public.hs_decks for select
    using ((select auth.uid()) = user_id);

create policy "Usuário cria os próprios decks"
    on public.hs_decks for insert
    with check ((select auth.uid()) = user_id);

create policy "Usuário atualiza os próprios decks"
    on public.hs_decks for update
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Usuário apaga os próprios decks"
    on public.hs_decks for delete
    using ((select auth.uid()) = user_id);

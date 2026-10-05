create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    username text check (username ~ '^[A-Za-z0-9_]{3,20}$'),
    created_at timestamptz not null default now()
);

create unique index profiles_username_key on public.profiles (lower(username));

alter table public.profiles enable row level security;

create policy "Perfis são públicos"
    on public.profiles for select
    using (true);

create policy "Usuário edita o próprio perfil"
    on public.profiles for update
    using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, username)
    values (new.id, nullif(trim(new.raw_user_meta_data ->> 'username'), ''));
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

create function public.is_username_available(name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select not exists (
        select 1 from public.profiles where lower(username) = lower(name)
    );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;

create table public.challenge_progress (
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    key text not null check (char_length(key) <= 100),
    value jsonb not null,
    updated_at timestamptz not null default now(),
    primary key (user_id, key)
);

alter table public.challenge_progress enable row level security;

create policy "Usuário lê o próprio progresso"
    on public.challenge_progress for select
    using ((select auth.uid()) = user_id);

create policy "Usuário cria o próprio progresso"
    on public.challenge_progress for insert
    with check ((select auth.uid()) = user_id);

create policy "Usuário atualiza o próprio progresso"
    on public.challenge_progress for update
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Usuário apaga o próprio progresso"
    on public.challenge_progress for delete
    using ((select auth.uid()) = user_id);

alter table public.profiles
    add column display_name text check (char_length(display_name) <= 50),
    add column bio text check (char_length(bio) <= 280),
    add column avatar_url text check (char_length(avatar_url) <= 500),
    add column favorite_pokemon integer check (favorite_pokemon between 1 and 1025),
    add column is_public boolean not null default true,
    add column updated_at timestamptz not null default now();

drop policy "Perfis são públicos" on public.profiles;

create policy "Perfis públicos ou o próprio"
    on public.profiles for select
    using (is_public or (select auth.uid()) = id);

create policy "Estatísticas de perfis públicos"
    on public.challenge_progress for select
    using (
        key like 'challenge-stats:%'
        and exists (
            select 1 from public.profiles
            where profiles.id = challenge_progress.user_id and profiles.is_public
        )
    );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "Usuário envia a própria foto"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Usuário atualiza a própria foto"
    on storage.objects for update to authenticated
    using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Usuário apaga a própria foto"
    on storage.objects for delete to authenticated
    using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Usuário lista as próprias fotos"
    on storage.objects for select to authenticated
    using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

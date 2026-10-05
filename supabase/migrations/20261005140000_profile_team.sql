alter table public.profiles
    add column team integer[] not null default '{}'
        check (cardinality(team) <= 6 and 1 <= all (team) and 1025 >= all (team));

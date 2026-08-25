create table if not exists public.noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  contenido text not null,
  imagen_url text,
  autor_id uuid references auth.users(id),
  autor_nombre text,
  creado_en timestamptz not null default now()
);

alter table public.noticias enable row level security;

create policy "noticias_lectura_publica"
  on public.noticias for select
  using (true);

create policy "noticias_escritura_director_admin"
  on public.noticias for insert
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'rol') in ('DIRECTOR', 'ADMINISTRADOR')
  );

create policy "noticias_actualizacion_director_admin"
  on public.noticias for update
  using (
    (auth.jwt() -> 'user_metadata' ->> 'rol') in ('DIRECTOR', 'ADMINISTRADOR')
  );

create policy "noticias_borrado_director_admin"
  on public.noticias for delete
  using (
    (auth.jwt() -> 'user_metadata' ->> 'rol') in ('DIRECTOR', 'ADMINISTRADOR')
  );

-- Bucket de almacenamiento para las imágenes de las noticias
insert into storage.buckets (id, name, public)
values ('noticias', 'noticias', true)
on conflict (id) do nothing;

create policy "noticias_imagenes_lectura_publica"
  on storage.objects for select
  using (bucket_id = 'noticias');

create policy "noticias_imagenes_subida_director_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'noticias'
    and (auth.jwt() -> 'user_metadata' ->> 'rol') in ('DIRECTOR', 'ADMINISTRADOR')
  );

create table if not exists public.diagnosticos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references auth.users(id),
  respuestas jsonb not null,
  perfil text not null,
  madurez int,
  validacion int,
  viabilidad int,
  traccion int,
  potencial int,
  semaforo jsonb,
  fortaleza_principal text,
  reto_principal text,
  ruta jsonb,
  profesor_recomendado text,
  objetivo_90_dias text,
  creado_en timestamptz not null default now()
);

alter table public.diagnosticos enable row level security;

create policy "diagnosticos_lectura_propia"
  on public.diagnosticos for select
  using (auth.uid() = usuario_id);

create policy "diagnosticos_insercion_propia"
  on public.diagnosticos for insert
  with check (auth.uid() = usuario_id);

create policy "diagnosticos_lectura_staff"
  on public.diagnosticos for select
  using (
    (auth.jwt() -> 'user_metadata' ->> 'rol') in ('PROFESOR', 'DIRECTOR', 'ADMINISTRADOR')
  );

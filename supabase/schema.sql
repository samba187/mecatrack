-- Mécatrack — Schéma Supabase complet (tables, RLS, storage)
-- À exécuter dans le SQL Editor de Supabase.

-- ── Tables ──────────────────────────────────────────────────────────────────

create table public.garages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  nom text not null,
  adresse text,
  telephone text,
  email text,
  logo_url text,
  siret text,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'trial' check (plan in ('trial', 'essentiel', 'pro', 'expired')),
  trial_ends_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index garages_user_id_idx on public.garages(user_id);

create table public.dossiers (
  id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages(id) on delete cascade,
  token_public text unique not null,
  client_nom text not null,
  client_telephone text,
  client_email text,
  vehicule_marque text not null,
  vehicule_modele text not null,
  vehicule_immat text not null,
  vehicule_annee int,
  kilometrage int,
  motif_entree text,
  statut text not null default 'en_attente'
    check (statut in ('en_attente', 'diagnostic', 'en_cours', 'en_attente_validation', 'pret', 'livre')),
  date_entree timestamptz not null default now(),
  date_prevue_sortie timestamptz,
  date_livraison timestamptz,
  notes_internes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index dossiers_garage_id_idx on public.dossiers(garage_id);
create index dossiers_token_idx on public.dossiers(token_public);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  url text not null, -- chemin dans le bucket privé "photos"
  legende text,
  visible_client boolean not null default true,
  created_at timestamptz not null default now()
);
create index photos_dossier_id_idx on public.photos(dossier_id);

create table public.devis (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  numero text not null,
  type text not null default 'initial' check (type in ('initial', 'supplementaire')),
  lignes jsonb not null default '[]'::jsonb,
  montant_ht numeric(10,2) not null,
  tva_pct numeric(5,2) not null default 20.00,
  montant_ttc numeric(10,2) not null,
  description text not null,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'accepte', 'refuse')),
  signature_base64 text,
  signature_at timestamptz,
  signe_par text,
  created_at timestamptz not null default now()
);
create index devis_dossier_id_idx on public.devis(dossier_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  auteur text not null check (auteur in ('garage', 'client')),
  contenu text not null,
  lu boolean not null default false,
  created_at timestamptz not null default now()
);
create index messages_dossier_id_idx on public.messages(dossier_id);

create table public.historique_statuts (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  ancien_statut text,
  nouveau_statut text not null,
  note text,
  created_at timestamptz not null default now()
);
create index historique_dossier_id_idx on public.historique_statuts(dossier_id);

create table public.prestations (
  id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages(id) on delete cascade,
  designation text not null,
  prix_ht numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
create index prestations_garage_id_idx on public.prestations(garage_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages(id) on delete cascade,
  type text not null check (type in ('devis_accepte', 'devis_refuse', 'message_client')),
  dossier_id uuid references public.dossiers(id) on delete cascade,
  titre text not null,
  corps text not null,
  lu boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_garage_id_idx on public.notifications(garage_id);

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Le garagiste connecté n'accède qu'à ses propres données.
-- La page publique /suivi/[token] passe par le service role (jamais exposé au client).

alter table public.garages enable row level security;
alter table public.dossiers enable row level security;
alter table public.photos enable row level security;
alter table public.devis enable row level security;
alter table public.messages enable row level security;
alter table public.historique_statuts enable row level security;
alter table public.prestations enable row level security;
alter table public.notifications enable row level security;

create policy "garage: lecture de son garage" on public.garages
  for select using (auth.uid() = user_id);
create policy "garage: mise à jour de son garage" on public.garages
  for update using (auth.uid() = user_id);

create policy "dossiers: accès complet à son garage" on public.dossiers
  for all using (
    garage_id in (select id from public.garages where user_id = auth.uid())
  );

create policy "photos: accès via son garage" on public.photos
  for all using (
    dossier_id in (
      select d.id from public.dossiers d
      join public.garages g on g.id = d.garage_id
      where g.user_id = auth.uid()
    )
  );

create policy "devis: accès via son garage" on public.devis
  for all using (
    dossier_id in (
      select d.id from public.dossiers d
      join public.garages g on g.id = d.garage_id
      where g.user_id = auth.uid()
    )
  );

create policy "messages: accès via son garage" on public.messages
  for all using (
    dossier_id in (
      select d.id from public.dossiers d
      join public.garages g on g.id = d.garage_id
      where g.user_id = auth.uid()
    )
  );

create policy "historique: accès via son garage" on public.historique_statuts
  for all using (
    dossier_id in (
      select d.id from public.dossiers d
      join public.garages g on g.id = d.garage_id
      where g.user_id = auth.uid()
    )
  );

create policy "prestations: accès à son garage" on public.prestations
  for all using (
    garage_id in (select id from public.garages where user_id = auth.uid())
  );

create policy "notifications: accès à son garage" on public.notifications
  for all using (
    garage_id in (select id from public.garages where user_id = auth.uid())
  );

-- ── Storage ─────────────────────────────────────────────────────────────────
-- Bucket privé pour les photos : les URLs signées sont générées côté serveur.

insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

# BRIEF PHASE 2 — Site Next.js + Dashboard

> 📌 **Pour Claude Code** : ce document contient toutes les instructions pour créer la version 2 du site "La Maison de David".
> L'utilisateur, **Lucas Malanda**, est **débutant**. Avance étape par étape, demande confirmation aux étapes clés, explique en français simple, fais des commits Git réguliers en français.

---

## 🎯 Vision globale

Le site actuel (`index.html` dans ce dossier) est un superbe HTML statique avec scrollytelling vidéo, déployé sur Vercel. **Il reste en ligne** pendant qu'on construit la v2.

La v2 sera un **Next.js + Supabase** avec :
1. Le site public (refait depuis le HTML, en composants React propres)
2. Un dashboard d'admin protégé pour gérer photos + événements + flyers
3. Page de don avec Stripe + PayPal + TWINT
4. Formulaire de contact fonctionnel (Resend)
5. Gestion bénévoles avec rôles

---

## ⚠️ ÉLÉMENTS CRITIQUES À PRÉSERVER

### Le scrollytelling vidéo du hero (NON NÉGOCIABLE)
Le site actuel utilise une animation cinématique sur le hero qui DOIT être préservée :

1. **Section hero haute** : `height: 220vh` avec un enfant `.hero-sticky` en `position: sticky`
2. **Deux vidéos superposées** :
   - `intro.mp4` (10s, 14 Mo, 241 keyframes pour scrub fluide) : voyage montagne → oasis
   - `loop.mp4` (4s, 2.9 Mo, ping-pong) : boucle pendule du médaillon
3. **Le scroll pilote la lecture** : `currentTime` de intro.mp4 est lié au scroll progress (0 → 60%)
4. **Transition automatique** : à 55% de progress, fade-in du loop.mp4 + fade-out de l'intro
5. **Fallback** : détection si le scrub ne fonctionne pas (3 échecs) → lecture auto
6. **Apparition séquencée des textes** :
   - Step 0 (vidéo chargée, scroll = 0) : "Bienvenue. / LA MAISON DE DAVID"
   - Step 1 (15-40%) : titre "Venez vous abreuver dans cette oasis."
   - Step 2 (40-70%) : citation Jean 4:14
   - Step 3 (70-100%) : boutons CTA
7. **Fond bleu nuit** avant chargement vidéo (pas d'image poster)
8. **Préférence reduced-motion** : remplace tout par image statique

### Le design (palette + typo)
- **Palette** : crème `#f5ecd9`, parchemin `#fdf8ec`, bleu nuit `#11162b`, or `#b8924a`, or profond `#8a6a2e`
- **Fonts** : Fraunces (display, italique caractérisé) + Manrope (body)
- **Style** : éditorial, chaleureux, spirituel — surtout pas un template générique

### Les 6 catégories de la galerie
1. Évangélisation
2. Groupe de prière
3. Soins d'âme
4. Culte protestant
5. Gospel Night
6. Atelier Gospel

### La page de don (reproduction de l'ancienne page Wix)
- **Texte d'intro** : « Par votre don, vous soutenez une œuvre qui partage l'Évangile à travers l'art, apporte l'espérance dans les temples et accompagne les jeunes... »
- **Fréquence** : toggle Unique | Mensuel
- **Montants** : 5 / 10 / 20 / 100 / 200 CHF + Autre
- **3 options de paiement** (dans l'ordre, TWINT en premier car 0% frais) :
  1. 📱 TWINT (QR code statique, fichier `twint-qr.avif` fourni dans /public)
  2. 💳 Carte bancaire (Stripe Checkout)
  3. 🅿️ PayPal (bouton don)

---

## 🛠️ Stack technique

| Composant | Outil | Rôle |
|-----------|-------|------|
| Framework | Next.js 15 (App Router) | Site + dashboard |
| Langage | TypeScript | Strict, pas de any |
| Styling | Tailwind CSS v4 | Avec les tokens couleurs |
| BDD + Auth + Storage | Supabase | Tout-en-un |
| Emails | Resend | Formulaire contact |
| Paiements CB | Stripe Checkout | Page don |
| Paiements PayPal | PayPal Donate Button | Embed |
| Paiements suisses | TWINT (QR statique) | Image dans /public |
| Hébergement | Vercel | Déploiement |
| Versionning | Git + GitHub | Commits FR |

---

## 📁 Structure du projet (cible)

```
maison-de-david-v2/
├── app/
│   ├── (public)/                 ← site public
│   │   ├── page.tsx              ← accueil
│   │   ├── don/page.tsx          ← page de don
│   │   └── layout.tsx
│   ├── admin/                    ← dashboard
│   │   ├── login/page.tsx        ← connexion (magic link + Google)
│   │   ├── page.tsx              ← tableau de bord (overview)
│   │   ├── evenements/
│   │   │   ├── page.tsx          ← liste
│   │   │   ├── nouveau/page.tsx  ← création
│   │   │   └── [id]/page.tsx     ← édition
│   │   ├── galerie/
│   │   │   ├── page.tsx          ← grille + upload
│   │   │   └── [id]/page.tsx     ← édition
│   │   ├── messages/page.tsx     ← boîte de réception
│   │   ├── dons/page.tsx         ← historique (lecture seule)
│   │   ├── utilisateurs/page.tsx ← gestion bénévoles (admin only)
│   │   └── layout.tsx            ← sidebar admin
│   ├── api/
│   │   ├── contact/route.ts      ← Resend
│   │   ├── stripe/checkout/route.ts
│   │   └── stripe/webhook/route.ts
│   └── layout.tsx
├── components/
│   ├── public/                   ← Hero, Mission, Gallery, etc.
│   └── admin/                    ← Sidebar, DataTable, FileUploader, etc.
├── lib/
│   ├── supabase/
│   │   ├── client.ts             ← browser
│   │   ├── server.ts             ← server (RLS)
│   │   └── middleware.ts
│   ├── stripe.ts
│   └── resend.ts
├── public/
│   ├── hero.avif
│   ├── twint-qr.avif
│   └── videos/
│       ├── intro.mp4
│       └── loop.mp4
├── middleware.ts                 ← protection /admin
└── ...
```

---

## 🗄️ Schéma Supabase

```sql
-- 1. Profils (étendus depuis auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'editor', -- 'admin' | 'editor'
  created_at timestamptz default now()
);

-- 2. Événements
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date timestamptz not null,
  location text,
  category text, -- libre : 'holy-disco', 'gospel-night', 'evangelisation', 'culte', 'autre'
  flyer_url text, -- URL Supabase Storage
  is_published boolean default true,
  created_at timestamptz default now(),
  created_by uuid references profiles(id)
);

-- 3. Médias galerie
create table media (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('photo', 'video')),
  category text not null check (category in (
    'evangelisation', 'priere', 'soins', 'culte', 'gospel-night', 'atelier'
  )),
  title text,
  src_url text not null,
  poster_url text, -- pour vidéos
  size_hint text default 'square' check (size_hint in ('tall', 'wide', 'square', 'large')),
  display_order int default 0,
  created_at timestamptz default now(),
  uploaded_by uuid references profiles(id)
);

-- 4. Messages contact
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  email text not null,
  phone text,
  message text not null,
  is_read boolean default false,
  is_archived boolean default false,
  created_at timestamptz default now()
);

-- 5. Dons (synchronisé via webhook Stripe)
create table donations (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  amount_chf int not null, -- centimes
  donor_email text,
  donor_name text,
  is_recurring boolean default false,
  status text default 'completed',
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table events enable row level security;
alter table media enable row level security;
alter table contact_messages enable row level security;
alter table donations enable row level security;

-- Lecture publique pour events publiés et media
create policy "events_select_public" on events for select using (is_published = true);
create policy "media_select_public" on media for select using (true);

-- Écriture pour utilisateurs auth
create policy "events_write_auth" on events
  for all using (auth.uid() in (select id from profiles));
create policy "media_write_auth" on media
  for all using (auth.uid() in (select id from profiles));

-- Messages : lecture admin/editor
create policy "messages_read_auth" on contact_messages
  for select using (auth.uid() in (select id from profiles));
-- Insertion publique (depuis le formulaire)
create policy "messages_insert_public" on contact_messages
  for insert with check (true);

-- Trigger : profil auto à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'editor');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

## 🚦 Étapes (à suivre dans l'ordre)

**RÈGLE D'OR** : à chaque étape majeure, **demander confirmation à Lucas**. Pas de "big bang".

### ÉTAPE 1 — Initialisation Next.js
- `npx create-next-app@latest .` avec TypeScript, Tailwind, App Router, ESLint, alias `@/*`
- Configurer les fonts Fraunces + Manrope dans `app/layout.tsx`
- Définir la palette dans `app/globals.css` (variables CSS pour cohérence avec le HTML actuel)
- ✋ **PAUSE** : Lucas voit la page d'accueil par défaut Next.js

### ÉTAPE 2 — Reprise du site en composants
- Copier les fichiers médias dans `/public` :
  - `hero.avif`, `twint-qr.avif` à la racine
  - `videos/intro.mp4`, `videos/loop.mp4`
- Créer les composants depuis `index.html` :
  - `components/public/Header.tsx`
  - `components/public/Hero.tsx` ← ⚠️ avec le SCROLLYTELLING VIDÉO préservé (220vh sticky, scrub, transition)
  - `components/public/Marquee.tsx`
  - `components/public/Mission.tsx`
  - `components/public/Events.tsx`
  - `components/public/Gallery.tsx` (avec lightbox)
  - `components/public/DonateBanner.tsx`
  - `components/public/Contact.tsx`
  - `components/public/Footer.tsx`
- ✋ **PAUSE** : Lucas teste sur localhost:3000 et confirme que ça ressemble au statique (scrollytelling fonctionnel inclus)

### ÉTAPE 3 — Supabase
1. Demander à Lucas si son compte est prêt (sinon le guider)
2. Créer un projet Supabase avec région **Frankfurt**
3. Récupérer les clés API et créer `.env.local` :
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
4. Installer : `npm install @supabase/supabase-js @supabase/ssr`
5. Créer `lib/supabase/client.ts` et `lib/supabase/server.ts`
6. Exécuter le SQL du schéma dans le SQL Editor Supabase
7. Créer 2 buckets Storage publics : `flyers` et `gallery`
8. ✋ **PAUSE**

### ÉTAPE 4 — Authentification
1. Dans Supabase, activer les providers :
   - **Email** (magic link OTP) — natif
   - **Google** — guider Lucas pour créer un OAuth Client dans Google Cloud Console
2. URL de redirection : `http://localhost:3000/auth/callback` + URL prod plus tard
3. Créer `/admin/login` avec 2 options : "Continuer avec Google" + "Recevoir un lien magique par email"
4. Créer `/auth/callback` qui finalise la session
5. Créer `middleware.ts` qui protège `/admin/*`
6. ✋ **PAUSE** : Lucas teste la connexion

### ÉTAPE 5 — Dashboard layout
1. Créer `app/admin/layout.tsx` avec sidebar :
   - Tableau de bord (overview)
   - Événements
   - Galerie
   - Messages
   - Dons
   - Utilisateurs (admin only)
   - Bouton "Voir le site" et "Se déconnecter"
2. Vue tableau de bord avec 4 KPI : nb événements à venir, messages non lus, total dons du mois, nb médias
3. ✋ **PAUSE**

### ÉTAPE 6 — Gestion des événements (priorité Lucas)
1. **Liste** : tableau (date, titre, lieu, catégorie, statut publié) + actions
2. **Création** : formulaire avec
   - Titre, description (textarea), date+heure (datetime-local), lieu, catégorie (select libre)
   - **Upload du flyer** : composant drag & drop vers Supabase Storage bucket `flyers`
   - Switch "Publier"
3. **Édition** : même formulaire pré-rempli
4. **Côté public** : la section Events charge depuis Supabase. **Au clic sur un événement**, ouvrir une lightbox qui affiche le flyer en grand
5. ✋ **PAUSE**

### ÉTAPE 7 — Gestion galerie (priorité Lucas)
1. **Liste** avec filtre par catégorie + filtre photo/vidéo
2. **Upload multiple** :
   - Drag & drop ou sélecteur, fichiers multiples
   - Au upload : choisir la catégorie, type auto-détecté
   - Pour vidéos : poster optionnel
   - Barre de progression
3. **Réorganisation** : drag-and-drop pour l'ordre d'affichage
4. **Suppression** avec confirmation
5. **Côté public** : Gallery charge depuis Supabase, filtres fonctionnent en live
6. ✋ **PAUSE**

### ÉTAPE 8 — Formulaire de contact (Resend)
1. Demander à Lucas de créer un compte Resend (gratuit, 3000 emails/mois)
2. Récupérer l'API key + créer `RESEND_API_KEY` dans `.env.local`
3. Expéditeur de départ : `onboarding@resend.dev` (pas besoin de domaine)
4. Créer `app/api/contact/route.ts` :
   - Validation Zod
   - Insertion dans `contact_messages`
   - Envoi email à `contact@maisondedavid.com`
   - Anti-spam : honeypot + rate limit
5. Brancher le formulaire public
6. **Page Messages dans dashboard** : tableau + marquer lu / archiver
7. ✋ **PAUSE**

### ÉTAPE 9 — Page de don
#### 9a. Stripe (CB)
1. Guider Lucas pour créer compte Stripe (mode test pour démarrer)
2. Clés : `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
3. `npm install stripe`
4. Page `/don` avec design conforme (cf. section "ÉLÉMENTS CRITIQUES" du brief)
5. Route `/api/stripe/checkout` qui crée une session
6. Webhook `/api/stripe/webhook` qui reçoit `checkout.session.completed`
7. Pages `/don/merci` et `/don/annule`

#### 9b. PayPal
1. Bouton PayPal Donate intégré

#### 9c. TWINT
1. Copier `twint-qr.avif` dans `/public/`
2. Afficher en premier dans la grille de don, taille min 220px

#### 9d. Layout
- Toggle Fréquence : Unique | Mensuel
- Montants prédéfinis + Autre
- 3 options en grille (TWINT, Stripe, PayPal)
- Le montant et la fréquence sont passés aux providers

### ÉTAPE 10 — Gestion utilisateurs/bénévoles
1. Page `/admin/utilisateurs` (admin only)
2. Liste + rôles
3. Inviter par email (Supabase invite)
4. Toggle role admin/editor

### ÉTAPE 11 — Déploiement
1. SEO : metadata, sitemap, robots, OpenGraph
2. Lighthouse > 90
3. Push GitHub (nouveau repo `maison-de-david-v2`)
4. Vercel : import du repo, configurer toutes les variables d'environnement
5. Tester en prod (mode test Stripe d'abord)
6. Passer Stripe en live quand l'asso est prête
7. Pointer le domaine `maisondedavid.com` (DNS) plus tard

---

## 🔐 Variables d'environnement (récap)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=onboarding@resend.dev

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
STRIPE_WEBHOOK_SECRET=

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_NOTIFICATION_EMAIL=contact@maisondedavid.com
```

---

## 📝 Règles de qualité

- **Demander confirmation à Lucas avant chaque création de compte externe** (Supabase, Resend, Stripe, PayPal, Google Cloud)
- **Guider pas-à-pas** : descriptions précises, où cliquer, quoi copier
- **Stocker les clés** dans `.env.local`, vérifier `.gitignore`
- **Commits Git réguliers** avec messages clairs en français
- **Tests à chaque étape** : rien en prod sans test local
- **RLS Supabase activée**, validation Zod côté serveur, rate limiting formulaire
- **Accessibilité** : labels, aria-*, navigation clavier
- **Responsive** : tester 375px, 768px, 1280px

---

## 🤝 Comment travailler avec Lucas

Lucas est **débutant**. Donc :

1. **Explique avant de faire** — "je vais maintenant créer X, qui sert à Y"
2. **Pas de jargon non expliqué** — si tu utilises "hydration", "RLS", "OAuth", explique en une phrase
3. **Demande confirmation aux étapes clés** — pas pour chaque ligne, mais pour chaque décision (Resend vs Formspree, Mux vs local, etc.)
4. **Teste en montrant à Lucas comment tester** — "ouvre localhost:3000 et tu devrais voir..."
5. **En cas d'erreur** : explique en français simple avant de corriger
6. **Commits Git** réguliers avec messages clairs en français — Lucas peut revenir en arrière

---

## ✅ Quand commencer

Quand Lucas dit "go" ou "démarre", commence par l'**ÉTAPE 1** (init Next.js).

Bonne chance ! 🙏

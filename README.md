# back_houel — Backend & dashboard (devis, factures, planning)

Back-office pour Antoine (plombier) : API Next.js pour gérer devis, factures et
planning. Voir [brief-backend-dashboard-plombier.md](./brief-backend-dashboard-plombier.md)
pour le contexte produit et les décisions d'architecture.

## Stack

- **Next.js 16** (App Router, API routes) + TypeScript
- **Prisma 7** + **Supabase** (Postgres + Storage)
- **Auth.js** (provider Credentials, sessions JWT)
- **Zod** pour la validation des entrées

## Setup

### 1. Créer un projet Supabase

Sur [supabase.com](https://supabase.com), créer un projet, puis récupérer dans
Project Settings → Database :
- la chaîne de connexion **poolée** (port 6543, PgBouncer)
- la chaîne de connexion **directe** (port 5432)

### 2. Configurer les variables d'environnement

Copier `.env.example` vers `.env` et remplir les valeurs (voir commentaires
dans le fichier pour le rôle de chaque variable) :

```bash
cp .env.example .env
```

Générer `AUTH_SECRET` :

```bash
npx auth secret
```

### 3. Installer les dépendances et appliquer le schéma

```bash
npm install
npm run db:migrate
```

`db:migrate` (= `prisma migrate dev`) crée les tables à partir de
[prisma/schema.prisma](./prisma/schema.prisma) et exécute automatiquement le
seed (voir `prisma7.config.ts`).

### 4. Créer le compte propriétaire (Antoine)

Le seed ([prisma/seed.ts](./prisma/seed.ts)) crée un compte `OWNER` si les
variables suivantes sont définies dans `.env` avant `npm run db:migrate` (ou
en relançant `npm run db:seed`) :

```env
SEED_OWNER_EMAIL="antoine@example.com"
SEED_OWNER_PASSWORD="mot-de-passe-temporaire"
```

Il crée aussi la ligne `FactureCounter` (id=1) nécessaire à la numérotation
légale des factures — indispensable même sans compte owner.

### 5. Lancer le serveur de dev

```bash
npm run dev
```

## Modèle de données — points d'attention

- **Numérotation des factures** : `Facture.numero` reste `null` tant que la
  facture est en brouillon. Le numéro légal n'est attribué qu'à l'émission
  (`POST /api/factures/:id/emettre`), via un compteur transactionnel
  (`FactureCounter`) verrouillé en base pour garantir une séquence sans trou
  même en cas d'émissions concurrentes. Voir
  [src/services/facture.service.ts](./src/services/facture.service.ts).
- **Immuabilité** : une fois émise (`verrouillee = true`), une facture ne peut
  plus être modifiée ni supprimée via l'API. Toute correction devra passer par
  un avoir (à modéliser plus tard).
- **Auth edge-safe** : [src/lib/auth.config.ts](./src/lib/auth.config.ts)
  (sans Prisma/bcrypt) est utilisé par [src/proxy.ts](./src/proxy.ts) qui
  tourne en edge runtime ; [src/lib/auth.ts](./src/lib/auth.ts) (config
  complète avec le provider Credentials) est utilisé uniquement côté route
  handlers (runtime Node). Ne pas importer `@/lib/auth` depuis `src/proxy.ts`.

## Endpoints disponibles (phase 1)

Toutes les routes `/api/*` sauf `/api/auth/*` et `/api/health` nécessitent une
session (401 sinon).

- `POST /api/auth/callback/credentials` — connexion (via Auth.js)
- `GET|POST /api/devis`, `GET|PATCH|DELETE /api/devis/:id`
- `GET|POST /api/factures`, `GET|PATCH|DELETE /api/factures/:id`
- `POST /api/factures/:id/emettre` — émission légale (irréversible)
- `GET|POST /api/interventions`, `GET|PATCH|DELETE /api/interventions/:id`

## Ce qui n'est pas encore fait

- Interface du dashboard (pages) — phase 1 backend = API uniquement
- Rappels planifiés (Vercel Cron) — en attente de préciser le besoin exact
- Mentions légales de facturation figées (dépend du statut juridique
  d'Antoine, encore à confirmer)
- Connexion directe entre le formulaire du site vitrine et cette API (lien
  email uniquement pour l'instant)

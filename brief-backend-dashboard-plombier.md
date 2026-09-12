# Brief projet — Backend & Dashboard (devis, factures, planning)

## Contexte
Ce projet est la **suite** d'un site vitrine déjà en cours pour un plombier
(client : Antoine, activité d'installation/rénovation planifiée — pas de dépannage
urgence). Le site vitrine (Next.js/Tailwind, déployé sur Vercel) fait l'objet d'un
brief séparé et n'est PAS concerné par ce document.

Ce brief couvre uniquement la partie back-office : un espace connecté où Antoine
gère ses devis, factures, et son planning. Ambition à terme (pas prioritaire, ne
pas sur-complexifier maintenant) : réutiliser cette base pour d'autres artisans du
BTP (électricien, peintre, plaquiste...).

## Pourquoi un projet séparé du site vitrine
Décision prise consciemment : séparer le front public (site vitrine) du
back-office, pour que la logique métier (devis, factures, planning) ne soit pas
emmêlée avec le site vitrine. Ça facilite une future duplication/réutilisation pour
d'autres clients artisans, même si aucun système multi-tenant n'est construit pour
l'instant.

## Stack technique validée
- **Backend / Front du dashboard** : **API routes Next.js**, un seul projet
  regroupant le front du dashboard et les endpoints backend. Décision prise
  volontairement pour la simplicité et le coût (voir raisonnement ci-dessous),
  plutôt que Java/Spring Boot ou NestJS séparés.
- **Base de données** : à définir techniquement avec Claude Code. Privilégier une
  offre serverless à palier gratuit généreux (ex : Neon ou Supabase/PostgreSQL)
  pour rester cohérent avec l'approche serverless du reste de la stack.
- **Hébergement** : Vercel (même plateforme que le site vitrine) — pas de service
  d'hébergement supplémentaire à payer tant que l'usage reste faible.

### Pourquoi ce choix plutôt que Java/Spring Boot ou NestJS séparé
- **Coût à l'échelle** : une instance Java/Spring Boot (ou NestJS classique) tourne
  en continu et coûte un montant fixe par client déployé (~5-10€/mois), alors que
  les API routes Next.js sont serverless — le coût suit l'usage réel, quasi nul
  tant que le trafic reste faible (cas d'un ou plusieurs artisans avec un usage
  modeste). C'est un critère important si l'idée de réutiliser ce projet pour
  plusieurs clients artisans se concrétise.
- **Simplicité opérationnelle** : un seul projet à héberger et déployer (front +
  back ensemble sur Vercel), plutôt que deux projets séparés à maintenir.
- **Compatibilité avec une intégration comptable (Pennylane ou équivalent)** :
  l'intégration se fait via une API REST classique, compatible avec n'importe quel
  langage — ce choix ne pénalise donc pas une future connexion à un outil de
  facturation/comptabilité externe.

### Chemin d'évolution si le projet grossit
Si la logique métier devient trop complexe pour rester confortable dans des API
routes Next.js (beaucoup de règles métier, besoin de mieux structurer en couches),
il sera possible d'extraire une vraie API séparée (NestJS, ou Java/Spring Boot si
préférence de confort à ce moment-là) sans perdre le travail déjà fait sur le
front — c'est un refactor ultérieur, pas un mur bloquant.

## Utilisateurs du dashboard
- Antoine (propriétaire) dès le départ
- Possibilité d'ajouter un employé/associé plus tard → prévoir un champ "rôle"
  simple (propriétaire / employé) dans le modèle de compte dès la conception,
  sans construire un système de permissions complexe maintenant

## Fonctionnalités par sous-phase (reprises du brief global)
1. **Devis** — créer un devis à partir d'une demande (issue du formulaire du site
   vitrine ou saisie manuelle), chiffrer les prestations, envoyer au client,
   suivre le statut (en attente / accepté / refusé)
2. **Factures** — transformer un devis accepté en facture. ⚠️ Respecter les
   mentions légales obligatoires en France (numérotation séquentielle, mentions
   légales de l'entreprise, TVA le cas échéant) — à valider avec Antoine (statut
   auto-entrepreneur ou société ?)
3. **Planning** — calendrier des interventions liées aux devis/factures en cours,
   disponibilités, rappels

## Décisions techniques prises
- **Fournisseur base de données** : **Supabase** (Postgres + Storage inclus,
  utile pour un futur upload de photos de devis sans lib supplémentaire)
- **ORM** : **Prisma**
- **Authentification** : **Auth.js**, provider credentials (email/mot de passe),
  utilisateurs stockés dans la base via Prisma — on n'utilise pas le service Auth
  intégré de Supabase, seulement sa base Postgres et son Storage
- **Rappels / tâches planifiées** (planning) : **Vercel Cron Jobs** — à préciser
  une fois le besoin exact de rappel défini (à qui, quand, quel contenu)
- **Lien formulaire devis (site vitrine) ↔ backend** : **email uniquement pour
  l'instant**, pas de connexion directe à l'API — cohérent avec le brief du site
  vitrine qui exclut tout backend en phase 1 ; connexion directe possible plus
  tard sans remise en cause de l'architecture

## Points encore ouverts / à définir
- Statut juridique d'Antoine (auto-entrepreneur / société) — impacte les mentions
  légales obligatoires sur les factures
- Détail du modèle de données (champs exacts d'un devis, d'une facture, d'un
  créneau de planning) — à construire avec Claude Code
- Outil de comptabilité/facturation externe à connecter plus tard (Pennylane ou
  équivalent) — intégration prévue via API REST, compatible avec ce choix de
  stack, mais outil final pas encore choisi
- Projet Supabase à créer (URL + clés + chaînes de connexion Postgres, pooled et
  directe) pour pouvoir connecter Prisma

## Ce qui est explicitement HORS scope pour l'instant
- Système multi-tenant / multi-client sur une même instance
- Abonnements ou facturation SaaS
- Permissions fines (rôles avancés) — un simple champ rôle suffit pour l'instant

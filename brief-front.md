# Brief projet — Site vitrine plombier (évolution possible en SaaS BTP)

## Contexte
Site vitrine pour un plombier (client : cousin, prénom Antoine), avec objectif à terme
de faire évoluer la solution vers un back-office complet, et potentiellement vers un
produit réutilisable pour d'autres artisans du BTP (plombier, électricien, peintre,
plaquiste...). Cette ambition SaaS reste une idée en arrière-plan : on ne complexifie
pas l'architecture pour ça maintenant, mais on garde un code propre (pas de valeurs
en dur spécifiques au client partout dans le code).

## Roadmap en 4 phases
1. **Site vitrine** (phase actuelle) — présentation, services, zone d'intervention, contact
2. **Demandes de devis en ligne** — formulaire structuré (type de prestation, photos, adresse)
3. **Back-office devis & factures** — espace connecté pour transformer une demande en
   devis chiffré puis en facture (attention aux mentions légales obligatoires en France)
4. **Planning** — calendrier des interventions, disponibilités, rappels

## Profil du client (Antoine, plombier)
- Activité : **installation et rénovation planifiée** (salle de bain, chauffe-eau,
  chaudière, tuyauterie...) — PAS de dépannage urgence. Le ton du site doit refléter
  ça : pas de "disponible 24/7", plutôt orienté projet et devis.
- Pas encore de photos de chantier ni d'avis clients disponibles. La section
  "Réalisations" est prévue dans la structure mais reste vide/masquée tant qu'on n'a
  pas de vrai contenu — ne pas inventer de faux avis ou fausses photos.
- Pas de nom de domaine existant : il faudra en acheter un.

## Scope détaillé — Phase 1 (site vitrine)
Pages / sections à prévoir :
- **Accueil** — accroche orientée projet ("Installation et rénovation sanitaire à
  [ville]"), CTA principal = "Demander un devis"
- **Services** — présentés par type de projet (salle de bain, chauffe-eau, chaudière,
  tuyauterie...), pas par urgence/non-urgence
- **Zone d'intervention** — villes/secteurs couverts (bon pour le référencement local)
- **Réalisations** — section prévue dans la structure, à activer/remplir dès que le
  client a des photos de chantier
- **Contact** — formulaire simple qui envoie un email (nom, téléphone, type de projet,
  message libre). Pas d'upload photo ni de logique complexe pour l'instant — cet
  enrichissement est prévu pour la phase 2, pas maintenant.

## Stack technique validée (phase 1)
- **Framework** : Next.js (React)
- **Style** : Tailwind CSS (+ composants type shadcn/ui pour aller vite sur un rendu
  soigné sans tout designer à la main)
- **Hébergement** : Vercel (gratuit pour ce type de site) pour le moment
- **Budget cible** : ≤ 15-20€/mois — en pratique le seul coût réel attendu est le nom
  de domaine (~10-15€/an)

Choix de stack fait consciemment différent des habitudes habituelles en Java/IntelliJ :
pour un site vitrine léger et rapide à rendre joli, l'écosystème JS/Tailwind est plus
adapté. Le back-office (phase 3, logique métier plus lourde) pourra revenir sur du
Java/Spring Boot si préférence pour rester dans un environnement plus familier à ce
moment-là — rien n'est tranché sur ce point pour l'instant.

## Identité visuelle
- **Palette validée** : vert-bleu moderne
  - Couleur principale (accent, boutons) : teal `#0f766e` / `#14b8a6`
  - Nuance claire : `#5eead4`
  - Fond clair : blanc / gris très clair `#f8fafc`
  - Texte fort / contraste : bleu-nuit `#0f172a`

## Services proposés (liste provisoire, à valider avec Antoine)
- **Salle de bain** — installation complète (douche, baignoire, WC, lavabo, robinetterie)
- **Chauffe-eau** — installation, remplacement (électrique ou thermodynamique)
- **Chaudière** — installation, remplacement, entretien
- **Tuyauterie / réseaux d'eau** — installation ou rénovation de la plomberie (cuivre, PER...)
- **Cuisine** — raccordement évier, lave-vaisselle, robinetterie
- **Rénovation complète de salle d'eau** — chantiers "clé en main" plus larges
- **Climatisation** — installation (à préciser : remplacement, entretien ?)

Cette liste doit être confirmée avec Antoine avant mise en ligne : quelles catégories
il fait vraiment, un exemple concret par catégorie, ses propres termes, et ce qu'il ne
fait pas (pour éviter les demandes hors sujet via le site).

## Points encore ouverts / à définir
- Nom de domaine à choisir et acheter
- Villes/secteurs exacts de la zone d'intervention
- Coordonnées définitives (téléphone, email de réception des devis)
- Stack technique de la phase 3 (back-office) — non tranchée

## Ce qui est explicitement HORS scope pour la phase 1
- Prise de RDV en ligne automatisée
- Génération de devis/factures
- Planning / calendrier
- Upload de photo dans le formulaire de contact
- Toute logique multi-client / multi-tenant (penser SaaS reste une idée, pas une
  contrainte d'implémentation à ce stade)
## Principes de travail

- Ne pas anticiper les phases 2 à 4 dans l'implémentation de la phase 1 sans raison concrète.
- Ne pas inventer de contenu, d'avis, de réalisations ou d'informations concernant Antoine.
- Privilégier une architecture simple, lisible et facilement évolutive.
- Éviter les valeurs spécifiques à Antoine dispersées dans le code lorsque leur centralisation est simple et pertinente.
- Ne pas introduire de backend, base de données ou système d'authentification tant que la phase actuelle ne le justifie pas.
- Favoriser les composants réutilisables et une séparation claire entre contenu, présentation et logique.
- Avant toute décision d'architecture importante, présenter les options et leurs compromis plutôt que considérer une solution comme acquise.
- Ne pas ajouter de fonctionnalité uniquement parce qu'elle pourrait être utile dans une future version SaaS.
- Le résultat doit rester simple à maintenir par un développeur seul.
# Collection Bruno — back_houel API

## Ouvrir la collection

1. Installer [Bruno](https://www.usebruno.com/) (gratuit, open-source)
2. **Open Collection** → sélectionner le dossier `bruno/back-houel`

## Configurer l'environnement

L'environnement `Local.bru` (avec les vrais identifiants) n'est **pas
versionné** — seul `Local.example.bru` l'est.

1. Copier `back-houel/environments/Local.example.bru` en `Local.bru` dans le
   même dossier
2. Dans Bruno, sélectionner l'environnement **Local** (menu déroulant en haut
   à droite) et renseigner `ownerEmail` / `ownerPassword` avec les identifiants
   du compte créé via le seed (voir [README.md](../README.md) racine)

## Lancer les tests

L'API utilise une session par cookie (pas de Bearer token, voir discussion
dans le projet). Bruno gère les cookies automatiquement entre requêtes.

**Ordre à respecter** :

1. **Auth** → `1 - Get CSRF Token` puis `2 - Login` (pose le cookie de session)
2. **Devis** → `2 - Create Devis` (capture `devisId`) puis `4 - Update Devis
   (accepter)` pour pouvoir le transformer en facture
3. **Factures** → `2 - Create Facture from Devis` (capture `factureId`)
4. **Interventions** → peut être testé indépendamment ou lié au `devisId`
   capturé

Les requêtes de création capturent automatiquement l'id créé dans une
variable (`devisId`, `factureId`, `interventionId`) réutilisée par les
requêtes Get/Update/Delete suivantes du même dossier — inutile de copier-coller
les ids à la main.

⚠️ `Factures > 5 - Emettre Facture` est **irréversible** (verrouille la
facture et lui attribue un numéro légal définitif) : à tester uniquement sur
une facture de test que vous acceptez de "consommer".

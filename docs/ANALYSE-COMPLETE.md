# Analyse complète du projet DealZone

**Projet :** DealZone — Application web de gestion de stock  
**Dossier :** `DealZone/`  
**Date :** 19 juillet 2026  
**Statut :** Analyse / conception (implémentation non démarrée)

---

# PARTIE A — CONTEXTE & OBJECTIFS

## A.1 Qu’est-ce que DealZone ?

DealZone est une **application web métier** destinée à gérer le stock d’une activité commerciale (boutique, dépôt, PME).

Elle couvre le cycle complet :
1. Référencer les produits, catégories et fournisseurs  
2. Enregistrer les mouvements de stock (entrées, sorties, inventaires)  
3. Suivre les niveaux et alertes  
4. Consulter un tableau de bord et des rapports  
5. Contrôler qui peut faire quoi (rôles)

Le nom et le logo (étiquette + pin localisation) donnent une identité “commerce / deals / zone”, mais le **cœur fonctionnel V1 est la gestion de stock**, pas un marketplace.

## A.2 Problèmes résolus

| Problème actuel (sans outil) | Solution DealZone |
|------------------------------|-------------------|
| Stock suivi sur papier / Excel | Stock centralisé en base PostgreSQL |
| Pas d’historique fiable | Chaque mouvement est tracé (qui, quand, pourquoi) |
| Ruptures surprises | Alertes seuil bas |
| Tout le monde a les mêmes droits | 3 rôles distincts |
| Pas de valorisation | Rapport valeur stock (qty × prix) |

## A.3 Objectifs mesurables V1

- Créer / modifier / supprimer (selon rôle) : produits, catégories, fournisseurs  
- Enregistrer un mouvement en < 30 secondes  
- Empêcher une sortie supérieure au stock disponible  
- Afficher les produits sous seuil sur le dashboard  
- Exporter un CSV du stock et des mouvements  
- Connexion sécurisée avec session et contrôle de rôle  

## A.4 Hors périmètre V1 (volontairement)

- Marketplace / paiement en ligne / panier client  
- Application mobile native (UI mobile-first web seulement)  
- Multi-sociétés / multi-tenant SaaS  
- Comptabilité complète (factures, TVA avancée)  
- Code-barres hardware (peut venir en V2)  
- Notifications push / email automatiques (optionnel V2)  
- Rôle “lecture seule” (écarté volontairement)

## A.5 Décisions déjà prises

| Sujet | Décision |
|-------|----------|
| Nom | DealZone |
| Dossier | `DealZone/` |
| Type | Web app (Next.js) |
| UI | Tailwind CSS 4 + DaisyUI 5 |
| BDD | PostgreSQL (administrée via pgAdmin) |
| Acteurs | 3 : Admin, Gestionnaire, Magasinier |
| Branding | Logo navy + orange |
| Formulaires | Style pill (maquette fournie) |
| Docs design | `docs/design/` |

## A.6 Points encore ouverts

| Sujet | Impact | Recommandation V1 |
|-------|--------|-------------------|
| Auth Google / Apple / Guest | Complexité OAuth | Email + mot de passe uniquement |
| Multi-entrepôt | Schéma BDD plus lourd | **1 seul dépôt** |
| Devise | Affichage montants | FCFA (ou à confirmer) |
| Photos produits | Stockage fichiers | Non en V1 (URL optionnelle plus tard) |
| Mot de passe oublié | Email SMTP | Lien UI présent, logique V2 si besoin |
| Inscription libre | Sécurité | **Non** — Admin crée les comptes |

---

# PARTIE B — ACTEURS & DROITS

## B.1 Les 3 acteurs

### 1. Admin
Responsable système et organisation.
- Crée / modifie / désactive les utilisateurs  
- Configure l’entreprise (nom, devise, seuil par défaut)  
- Accès total à tous les modules  
- Peut supprimer des données sensibles (avec confirmation)

### 2. Gestionnaire
Responsable catalogue et stock.
- Gère catégories, fournisseurs, produits  
- Enregistre tous types de mouvements + inventaire  
- Consulte dashboard et exporte rapports  
- Ne gère pas les comptes ni les paramètres critiques

### 3. Employé / Magasinier
Opérationnel terrain.
- Consulte le stock et le dashboard  
- Enregistre entrées et sorties  
- N’a pas accès à la gestion des users, ni (par défaut) aux suppressions produit / paramètres  
- Inventaire : droit optionnel (à activer ou non — défaut : **oui lecture + ajustement simple** ou **non** ; recommandation : **ajustement autorisé** pour inventaire terrain)

## B.2 Matrice des droits détaillée

| Fonctionnalité | Admin | Gestionnaire | Magasinier |
|----------------|:-----:|:------------:|:----------:|
| Se connecter / déconnecter | ✓ | ✓ | ✓ |
| Voir son profil | ✓ | ✓ | ✓ |
| Dashboard | ✓ | ✓ | ✓ |
| Liste / détail produits | ✓ | ✓ | ✓ |
| Créer / modifier produit | ✓ | ✓ | ✗ |
| Supprimer produit | ✓ | ✓ | ✗ |
| CRUD catégories | ✓ | ✓ | ✗ |
| CRUD fournisseurs | ✓ | ✓ | ✗ |
| Entrée stock (IN) | ✓ | ✓ | ✓ |
| Sortie stock (OUT) | ✓ | ✓ | ✓ |
| Ajustement inventaire (ADJUST) | ✓ | ✓ | ✓ |
| Historique mouvements | ✓ | ✓ | ✓ (filtre limité) |
| Rapports + export CSV | ✓ | ✓ | ✗ |
| Paramètres entreprise | ✓ | ✗ | ✗ |
| CRUD utilisateurs | ✓ | ✗ | ✗ |
| Seed / reset données | ✓ (dev) | ✗ | ✗ |

## B.3 Règles transverses

- Toute action métier est liée à un `user_id` (traçabilité)  
- Le middleware bloque l’accès aux pages non autorisées  
- Les Server Actions vérifient aussi le rôle (jamais confiance UI seule)  
- Un Magasinier ne voit pas le menu “Utilisateurs” / “Paramètres”

---

# PARTIE C — BESOINS FONCTIONNELS (PAR MODULE)

## C.1 Authentification

### Écrans
1. **Connexion** (`/login`) — maquette de référence  
2. **Inscription** — réservée Admin ou désactivée public ; alternative : Admin crée le user dans Paramètres  
3. (Optionnel) Mot de passe oublié  

### Comportement Connexion
- Champs : Email, Mot de passe  
- Validation : email format, mot de passe requis  
- Erreur : “Identifiants incorrects” (message générique)  
- Succès → redirection `/` (dashboard) selon rôle  
- Session persistante (cookie httpOnly)

### UI imposée (maquette)
- Logo DealZone centré en haut  
- Titre “Connexion” navy bold  
- Inputs pill + icônes  
- Toggle œil mot de passe  
- Lien “Mot de passe oublié ?”  
- Bouton orange “Connexion”  
- Séparateur “ou”  
- Boutons sociaux : **masqués ou désactivés en V1** (structure prête)  
- Footer : pas d’inscription publique si Admin-only

## C.2 Dashboard (`/`)

### Widgets
1. Carte **Valeur totale du stock** (Σ quantity × purchase_price ou sale_price — à choisir : **prix d’achat** pour valorisation stock)  
2. Carte **Nombre de produits**  
3. Carte **Alertes stock bas** (quantity ≤ alert_threshold)  
4. Carte **Mouvements aujourd’hui**  
5. Liste **Derniers mouvements** (10)  
6. Graphique simple **Entrées vs Sorties** (7 ou 30 jours)

### Interactions
- Clic alerte → filtre produits sous seuil  
- Clic mouvement → détail / liste mouvements  

## C.3 Produits (`/products`)

### Liste
- Table : SKU, Nom, Catégorie, Quantité, Seuil, Prix vente, Statut stock, Actions  
- Recherche (nom / SKU)  
- Filtre catégorie, filtre statut (OK / bas / rupture)  
- Pagination  

### Création / Édition (formulaire pill)
| Champ | Type | Obligatoire | Règles |
|-------|------|:-----------:|--------|
| SKU / Code | text | ✓ | Unique |
| Nom | text | ✓ | Min 2 car. |
| Description | textarea | ✗ | — |
| Unité | select/text | ✓ | ex. pièce, kg, carton |
| Prix d’achat | number | ✓ | ≥ 0 |
| Prix de vente | number | ✓ | ≥ 0 |
| Quantité initiale | number | ✓ (création) | ≥ 0 ; ensuite via mouvements |
| Seuil d’alerte | number | ✓ | ≥ 0 |
| Catégorie | select | ✓ | FK |
| Fournisseur | select | ✗ | FK nullable |
| Image URL | text | ✗ | V1 optionnel / désactivé |

### Suppression
- Confirmation modal  
- Soft-delete recommandé si mouvements existent (sinon bloquer hard delete)

### Statuts stock (calculés)
- **Rupture** : quantity = 0  
- **Bas** : 0 < quantity ≤ alert_threshold  
- **OK** : quantity > alert_threshold  

## C.4 Catégories (`/categories`)

| Champ | Obligatoire |
|-------|:-----------:|
| Nom | ✓ (unique) |
| Description | ✗ |

- Impossible de supprimer une catégorie liée à des produits (ou réassignation forcée)

## C.5 Fournisseurs (`/suppliers`)

| Champ | Obligatoire |
|-------|:-----------:|
| Nom | ✓ |
| Email | ✗ (format si rempli) |
| Téléphone | ✗ |
| Adresse | ✗ |

## C.6 Mouvements de stock (`/movements`)

### Types
| Type | Effet sur quantity | Exemples de motifs |
|------|--------------------|--------------------|
| IN | +qty | Achat, retour client, production |
| OUT | −qty | Vente, perte, casse, transfert sortant |
| ADJUST | set ou ± selon logique | Inventaire (recommandé : saisir **nouvelle quantité réelle**, système calcule le delta) |

### Formulaire mouvement
| Champ | Obligatoire |
|-------|:-----------:|
| Produit | ✓ |
| Type | ✓ |
| Quantité | ✓ (> 0) |
| Motif | ✓ |
| Référence (n° facture / BL) | ✗ |
| Note | ✗ |
| Date | auto (now) ; éditable optionnel Admin |

### Règles métier critiques
1. OUT : `quantity_demandée ≤ product.quantity` sinon erreur  
2. Tout mouvement = **transaction atomique**  
3. Impossible de modifier un mouvement passé (annulation = mouvement inverse) — V1 simple  
4. Afficher stock actuel sur le formulaire avant validation  

## C.7 Inventaire (`/inventory`)

- Sélection produit → quantité théorique affichée → saisie quantité physique  
- Création automatique d’un ADJUST avec delta  
- Journal des inventaires  

## C.8 Rapports (`/reports`)

1. **État du stock** — tous produits + valorisation → CSV  
2. **Mouvements par période** — filtres dates / type / produit → CSV  
3. **Sous seuil** — liste alertes → CSV  

Accès : Admin + Gestionnaire uniquement.

## C.9 Paramètres (`/settings`)

### Entreprise (Admin)
- Nom, adresse, devise, seuil d’alerte par défaut  

### Utilisateurs (Admin)
- Liste users  
- Créer : nom, email, mot de passe temporaire, rôle  
- Modifier rôle / désactiver compte  
- Pas de suppression dure si historique (désactivation)

### Profil (tous)
- Voir nom, email, rôle  
- Changer mot de passe  

---

# PARTIE D — BESOINS NON FONCTIONNELS

| Catégorie | Exigence |
|-----------|----------|
| Performance | Listes paginées (20–50 lignes) ; dashboard < 2s en local |
| Sécurité | Hash mdp, cookies httpOnly, CSRF via Server Actions Next, validation Zod |
| Disponibilité | App mono-instance locale V1 (pas de HA) |
| Usabilité | Mobile-first, formulaires pill, feedback toast succès/erreur |
| Accessibilité | Labels, contrastes navy/orange sur blanc, focus visible |
| Maintenabilité | Prisma migrations, structure `actions/` / `components/` claire |
| i18n | Français uniquement V1 |
| Audit | `stock_movements.user_id` + timestamps |

---

# PARTIE E — ARCHITECTURE TECHNIQUE

## E.1 Stack

| Couche | Choix |
|--------|--------|
| Runtime UI | React 19 |
| Framework | Next.js 16 (App Router) |
| Styles | Tailwind CSS 4 + DaisyUI 5 |
| BDD | PostgreSQL |
| Admin BDD | pgAdmin |
| ORM | Prisma |
| Validation | Zod |
| Auth | Auth.js (NextAuth) v5 **ou** session custom JWT/cookie |
| Icons | react-icons |

## E.2 Schéma de flux

```
[ Navigateur ]
      │
      ▼
[ Next.js Middleware ] ─── non authentifié → /login
      │                    rôle insuffisant → 403 / redirect
      ▼
[ Pages App Router ]
      │  lecture : Server Components + Prisma
      │  écriture : Server Actions + Zod + check rôle
      ▼
[ Prisma Client ]
      ▼
[ PostgreSQL — dealzone_db ]
```

## E.3 Principes de conception

1. **Server-first** : données sensibles jamais exposées sans contrôle  
2. **Une source de vérité stock** : colonne `products.quantity` + historique `stock_movements`  
3. **UI = présentation** : les règles métier vivent côté serveur  
4. **Design system DealZone** : navy / orange / pills documentés dans `docs/design/`  

## E.4 Variables d’environnement

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/dealzone_db
AUTH_SECRET=...
# optionnel plus tard
# SMTP_..., GOOGLE_CLIENT_ID=...
```

---

# PARTIE F — MODÈLE DE DONNÉES (COMPLET)

## F.1 Diagramme relationnel (texte)

```
users 1───N stock_movements
users (créés par admin)

categories 1───N products
suppliers 1───N products

products 1───N stock_movements

company_settings (1 ligne)
```

## F.2 Tables détaillées

### users
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid / serial | PK |
| name | varchar | not null |
| email | varchar | unique, not null |
| password_hash | varchar | not null |
| role | enum | ADMIN \| GESTIONNAIRE \| MAGASINIER |
| is_active | boolean | default true |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | |

### categories
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | PK | |
| name | varchar | unique, not null |
| description | text | nullable |
| created_at | timestamptz | |

### suppliers
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | PK | |
| name | varchar | not null |
| email | varchar | nullable |
| phone | varchar | nullable |
| address | text | nullable |
| created_at | timestamptz | |

### products
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | PK | |
| sku | varchar | unique, not null |
| name | varchar | not null |
| description | text | nullable |
| unit | varchar | not null |
| purchase_price | decimal(12,2) | ≥ 0 |
| sale_price | decimal(12,2) | ≥ 0 |
| quantity | integer | ≥ 0 |
| alert_threshold | integer | ≥ 0 |
| category_id | FK | not null |
| supplier_id | FK | nullable |
| image_url | varchar | nullable |
| is_active | boolean | default true |
| created_at / updated_at | timestamptz | |

### stock_movements
| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | PK | |
| product_id | FK | not null |
| type | enum | IN \| OUT \| ADJUST |
| quantity | integer | > 0 (valeur absolue du mouvement) |
| quantity_before | integer | snapshot |
| quantity_after | integer | snapshot |
| reason | varchar | not null |
| reference | varchar | nullable |
| note | text | nullable |
| user_id | FK | not null |
| created_at | timestamptz | |

### company_settings
| Colonne | Type |
|---------|------|
| id | PK |
| company_name | varchar |
| address | text |
| currency | varchar (ex. XOF, EUR) |
| default_alert_threshold | integer |

## F.3 Index recommandés

- `products(sku)` unique  
- `products(category_id)`, `products(quantity)`  
- `stock_movements(product_id, created_at)`  
- `stock_movements(type, created_at)`  
- `users(email)` unique  

## F.4 Seed initial

- 1 Admin (email/mdp de démo)  
- 1 Gestionnaire + 1 Magasinier  
- Quelques catégories, fournisseurs, produits  
- Quelques mouvements d’exemple  
- 1 ligne `company_settings` (DealZone, devise…)  

---

# PARTIE G — ÉCRANS & NAVIGATION

## G.1 Arborescence des routes

```
/login
/                       → Dashboard
/products
/products/new
/products/[id]
/products/[id]/edit
/categories
/suppliers
/movements
/movements/new
/inventory
/reports
/settings               → Admin
/settings/users         → Admin
/profile
```

## G.2 Menu sidebar (selon rôle)

| Menu | Admin | Gestionnaire | Magasinier |
|------|:-----:|:------------:|:----------:|
| Dashboard | ✓ | ✓ | ✓ |
| Produits | ✓ | ✓ | ✓ |
| Catégories | ✓ | ✓ | ✗ |
| Fournisseurs | ✓ | ✓ | ✗ |
| Mouvements | ✓ | ✓ | ✓ |
| Inventaire | ✓ | ✓ | ✓ |
| Rapports | ✓ | ✓ | ✗ |
| Paramètres | ✓ | ✗ | ✗ |
| Profil | ✓ | ✓ | ✓ |

## G.3 Wireframe logique Login

```
┌─────────────────────────┐
│      [Logo DealZone]    │
│       Connexion         │
│  [✉ Email          ]    │
│  [🔒 Password    👁]    │
│      Mot de passe oublié│
│  [    Connexion     ]   │  ← orange pill
│ ──────── ou ────────    │
│  (sociaux désactivés V1)│
└─────────────────────────┘
```

## G.4 Wireframe logique Dashboard

```
┌ Logo │ DealZone          User ▾ ┐
├────────┬────────────────────────┤
│ Menu   │  Cartes KPI (4)        │
│ ...    │  Alertes               │
│        │  Graphique             │
│        │  Derniers mouvements   │
└────────┴────────────────────────┘
```

---

# PARTIE H — DESIGN SYSTEM

## H.1 Couleurs marque (logo)

| Token | Hex indicatif | Usage |
|-------|---------------|--------|
| Navy | `#0A1628` | Titres, textes forts |
| Orange | `#FF6600` | Boutons primaires, accents |
| Blanc | `#FFFFFF` | Fonds |
| Gris bordure | `#E5E7EB` | Inputs |
| Gris muted | `#9CA3AF` | Placeholders |
| Gris soft | `#F3F4F6` | Boutons neutres |
| Noir | `#000000` | Fond splash logo |

## H.2 Composants UI récurrents

- Input pill + icône gauche  
- Button primary orange pill  
- Button secondary / ghost  
- Table DaisyUI + badges statut  
- Modal confirmation  
- Toast succès / erreur  
- Sidebar + topbar  
- Empty states (“Aucun produit”)  

## H.3 Assets documentés

```
DealZone/docs/design/
├── logo-dealzone.png
├── LOGO-REFERENCE.md
├── formulaire-reference.png
└── FORMULAIRE-REFERENCE.md
```

---

# PARTIE I — API / SERVER ACTIONS (CONTRAT LOGIQUE)

Pas besoin d’API REST publique V1 : **Server Actions** suffisent.

| Action | Entrée | Sortie | Rôles |
|--------|--------|--------|-------|
| login | email, password | session | public |
| logout | — | clear session | auth |
| createUser | name, email, password, role | user | Admin |
| updateUser | id, fields | user | Admin |
| listProducts | filters, page | list | tous |
| createProduct | fields | product | Admin, Gest. |
| updateProduct | id, fields | product | Admin, Gest. |
| deleteProduct | id | ok | Admin, Gest. |
| createCategory / update / delete | … | … | Admin, Gest. |
| createSupplier / update / delete | … | … | Admin, Gest. |
| createMovement | productId, type, qty, … | movement | tous (auth) |
| adjustInventory | productId, physicalQty | movement | tous (auth) |
| getDashboardStats | — | stats | tous |
| exportStockCsv | — | file | Admin, Gest. |
| exportMovementsCsv | dateFrom, dateTo | file | Admin, Gest. |
| updateSettings | fields | settings | Admin |
| changePassword | old, new | ok | tous |

---

# PARTIE J — RÈGLES MÉTIER (RÉCAP CRITIQUES)

1. SKU unique  
2. quantity jamais négative  
3. OUT refusée si stock insuffisant  
4. Mouvement = transaction (update product + insert movement)  
5. Snapshots `quantity_before` / `quantity_after`  
6. Soft-delete / blocage delete si historique  
7. Compte `is_active = false` → login refusé  
8. Valorisation stock = Σ (quantity × purchase_price)  
9. Alerte si quantity ≤ alert_threshold  
10. Devise affichée depuis `company_settings.currency`

---

# PARTIE K — STRUCTURE CODE CIBLE

```
DealZone/
├── docs/
│   ├── ANALYSE-COMPLETE.md          ← ce document
│   └── design/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── logo-dealzone.png
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── products/...
│   │   │   ├── categories/...
│   │   │   ├── suppliers/...
│   │   │   ├── movements/...
│   │   │   ├── inventory/...
│   │   │   ├── reports/...
│   │   │   ├── settings/...
│   │   │   └── profile/...
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # InputPill, ButtonPrimary...
│   │   ├── layout/             # Sidebar, Topbar
│   │   ├── products/
│   │   ├── movements/
│   │   └── dashboard/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── actions/
│   ├── schemas/                # Zod
│   └── types/
├── .env.example
└── package.json
```

---

# PARTIE L — PLAN DE RÉALISATION

| Phase | Livrable | Critère de fin |
|-------|----------|----------------|
| 0 | Analyse + design | Docs présents ← **fait** |
| 1 | Scaffold Next + thème + logo | App démarre, login UI statique |
| 2 | Postgres + Prisma + seed + auth réelle | Login Admin seed OK |
| 3 | Layout + Dashboard branché | KPI réels |
| 4 | CRUD catégories, fournisseurs, produits | Données persistées |
| 5 | Mouvements + transactions | Stock cohérent |
| 6 | Inventaire + alertes + CSV | Rapports OK |
| 7 | Users/rôles + polish + tests manuels | Matrice droits respectée |

### Tests manuels minimaux (phase 7)
- [ ] Login / logout chaque rôle  
- [ ] Magasinier bloqué sur /settings  
- [ ] Sortie > stock → erreur  
- [ ] Entrée augmente quantity  
- [ ] Inventaire ajuste correctement  
- [ ] Export CSV téléchargeable  
- [ ] Responsive mobile login + liste produits  

---

# PARTIE M — RISQUES & MITIGATIONS

| Risque | Mitigation |
|--------|------------|
| Double soumission formulaire mouvement | Disable bouton + transaction idempotente / loading |
| Incohérence stock | Toujours transaction Prisma |
| Suppression produit avec historique | Soft-delete ou interdiction |
| Secrets dans git | `.env` gitignore + `.env.example` |
| Divergence UI maquette vs logo | Structure pill + couleurs navy/orange documentées |
| Scope creep (marketplace) | Hors V1 explicite |

---

# PARTIE N — PRÉREQUIS ENVIRONNEMENT

1. Node.js LTS installé  
2. PostgreSQL installé et service démarré  
3. pgAdmin connecté au serveur local  
4. Base créée : `dealzone_db`  
5. Utilisateur Postgres avec droits sur cette base  
6. Chaîne `DATABASE_URL` prête  

---

# PARTIE O — SYNTHÈSE EXÉCUTIVE

**DealZone** est une application web Next.js de gestion de stock, complète pour une V1 PME :

- **3 acteurs** : Admin, Gestionnaire, Magasinier  
- **Modules** : Auth, Dashboard, Produits, Catégories, Fournisseurs, Mouvements, Inventaire, Rapports, Paramètres  
- **BDD** : PostgreSQL (pgAdmin) via Prisma  
- **UI** : DaisyUI, formulaires pill, marque navy/orange + logo  
- **Cœur métier** : mouvements transactionnels + alertes + exports  

**État actuel :** conception et assets design prêts dans `DealZone/docs/`.  
**Prochaine étape concrète :** Phase 1 — générer le projet Next.js dans `DealZone` et appliquer le thème + écran de connexion.

---

*Document de référence unique du projet. Toute évolution de scope doit mettre à jour ce fichier.*

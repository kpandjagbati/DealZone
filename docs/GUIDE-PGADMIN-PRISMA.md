# Créer & connecter la BDD — pgAdmin + Prisma

## Ce qu’il faut comprendre

| Outil | Rôle |
|-------|------|
| **PostgreSQL** | Le serveur de base de données (déjà installé chez toi) |
| **pgAdmin** | Interface pour créer / voir la base |
| **Prisma** | ORM dans Next.js qui parle à PostgreSQL via `DATABASE_URL` |

Tu crées la base dans **pgAdmin**, puis tu donnes l’adresse de cette base à **Prisma** dans le fichier `.env`.

---

# PARTIE 1 — Créer la base dans pgAdmin

## 1. Ouvrir pgAdmin

1. Menu Démarrer → **pgAdmin 4**
2. À gauche : **Servers** → clique sur **PostgreSQL 18**
3. Entre le mot de passe de l’utilisateur **`postgres`** (celui de l’installation)
4. OK

## 2. Créer la base `dealzone_db`

1. Déplie **PostgreSQL 18**
2. Clic droit sur **Databases** → **Create** → **Database…**
3. Remplis :
   - **Database** : `dealzone_db`
   - **Owner** : `postgres`
4. Clique **Save**

Tu dois voir `dealzone_db` dans la liste.

## 3. (Optionnel) Vérifier avec une requête

1. Clic sur `dealzone_db`
2. Ouvre **Query Tool** (icône ou clic droit → Query Tool)
3. Tape :

```sql
SELECT current_database();
```

4. Exécute (F5) → doit afficher `dealzone_db`

> Pour l’instant la base est **vide**. Les tables seront créées par **Prisma** (migration), pas besoin d’exécuter le gros SQL à la main si tu utilises Prisma.

---

# PARTIE 2 — Connecter Prisma à cette base

## 1. Ouvrir le fichier `.env`

Chemin :

```
DealZone/.env
```

## 2. Remplacer `DATABASE_URL`

**Efface** l’ancienne ligne du type :

```env
DATABASE_URL="prisma+postgres://localhost:51213/..."
```

**Mets à la place** (remplace `TON_MOT_DE_PASSE`) :

```env
DATABASE_URL="postgresql://postgres:TON_MOT_DE_PASSE@localhost:5432/dealzone_db?schema=public"
```

### Exemple

Si ton mot de passe Postgres est `MonPass123` :

```env
DATABASE_URL="postgresql://postgres:MonPass123@localhost:5432/dealzone_db?schema=public"
```

### Détail de l’URL

```
postgresql://USER:PASSWORD@HOST:PORT/NOM_BASE?schema=public
              │      │        │     │      │
              │      │        │     │      └─ dealzone_db
              │      │        │     └─ 5432 (port par défaut)
              │      │        └─ localhost
              │      └─ mot de passe postgres
              └─ utilisateur postgres
```

> Si ton mot de passe contient des caractères spéciaux (`@`, `#`, `%`…), il faut les encoder dans l’URL.  
> Ex. `@` → `%40`

Ajoute aussi (recommandé) :

```env
AUTH_SECRET="une-longue-chaine-secrete"
```

Générer un secret :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Vérifier la connexion Prisma

Dans le terminal :

```bash
cd "/c/Users/GbatiAristideKPANDJA/Desktop/nextjs/DealZone"
npx prisma db pull
```

- **OK** → Prisma a bien parlé à PostgreSQL (même si la base est encore vide)  
- **Erreur auth** → mauvais mot de passe dans `.env`  
- **database does not exist** → `dealzone_db` pas encore créée dans pgAdmin  

Autre test utile :

```bash
npx prisma validate
```

---

# PARTIE 3 — Créer les tables avec Prisma (après le schéma)

Quand le fichier `prisma/schema.prisma` contiendra les modèles DealZone, tu lanceras :

```bash
# 1) Appliquer le schéma → crée les tables dans dealzone_db
npx prisma migrate dev --name init

# 2) Générer le client Prisma (obligatoire en Prisma 7)
npx prisma generate
```

Puis pour **voir** les tables dans pgAdmin :

1. Clic droit sur `dealzone_db` → **Refresh**
2. Déplie : **Schemas** → **public** → **Tables**
3. Tu verras : `users`, `products`, `categories`, etc.

Pour explorer les données via Prisma :

```bash
npx prisma studio
```

→ s’ouvre dans le navigateur (souvent http://localhost:5555)

---

# Récap visuel

```
pgAdmin
  └── Créer dealzone_db
           │
           ▼
     PostgreSQL :5432
           │
           │  DATABASE_URL dans .env
           ▼
        Prisma
           │
           │  prisma migrate dev
           ▼
     Tables dans dealzone_db
           │
           ▼
     Ton app Next.js
```

---

# Checklist

- [ ] pgAdmin ouvert, connecté à PostgreSQL 18
- [ ] Base `dealzone_db` créée
- [ ] `.env` avec `postgresql://postgres:...@localhost:5432/dealzone_db`
- [ ] Plus d’URL `prisma+postgres://...`
- [ ] `npx prisma db pull` ou `validate` sans erreur
- [ ] (Ensuite) schéma Prisma + `migrate dev`

---

Quand la checklist jusqu’à `DATABASE_URL` est OK, dis-moi **« .env OK »** — je te prépare le `schema.prisma` complet DealZone + la commande migrate.

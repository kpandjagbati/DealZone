# Guide d’installation & configuration — DealZone

Guide pas à pas pour Windows.  
État détecté sur ta machine (19/07/2026) :

| Outil | Statut |
|-------|--------|
| Node.js v24 + npm | Déjà installé |
| Git | Déjà installé |
| PostgreSQL 18 | Déjà installé (`C:\Program Files\PostgreSQL\18`) |
| pgAdmin 4 | Déjà inclus avec PostgreSQL |

Tu n’as **pas** besoin de réinstaller Node ni PostgreSQL.  
Suis les étapes ci-dessous dans l’ordre.

---

# ÉTAPE 0 — Vérifier que PostgreSQL tourne

## 0.1 Ouvrir les Services Windows

1. Appuie sur `Windows + R`
2. Tape : `services.msc` → Entrée
3. Cherche un service du type :
   - `postgresql-x64-18`
   - ou `PostgreSQL Server 18`
4. Statut doit être **En cours d’exécution**
5. Sinon : clic droit → **Démarrer**

## 0.2 (Optionnel) Ajouter `psql` au PATH

Pour utiliser `psql` dans le terminal :

1. Windows + S → “variables d’environnement”
2. Variables d’environnement → Path → Modifier → Nouveau
3. Ajoute :
   ```
   C:\Program Files\PostgreSQL\18\bin
   ```
4. OK partout, **ferme et rouvre** ton terminal

Vérification :
```bash
psql --version
```

---

# ÉTAPE 1 — Ouvrir pgAdmin

1. Menu Démarrer → cherche **pgAdmin 4**
2. Ou lance :
   ```
   C:\Program Files\PostgreSQL\18\pgAdmin 4\runtime\pgAdmin4.exe
   ```
3. Au premier lancement, pgAdmin demande un **mot de passe maître** (pour pgAdmin lui-même) :
   - Choisis-en un et **note-le**
4. Dans le panneau gauche :
   - **Servers** → **PostgreSQL 18**
5. Il te demande le **mot de passe du superutilisateur Postgres**  
   (= celui défini à l’installation de PostgreSQL, souvent pour l’utilisateur `postgres`)
6. Coche “Save password” si tu veux, puis OK

> Si tu as oublié le mot de passe `postgres`, dis-le-moi : on fera la procédure de reset.

---

# ÉTAPE 2 — Créer la base `dealzone_db`

Dans pgAdmin :

1. Clic droit sur **Databases** → **Create** → **Database…**
2. Remplis :
   - **Database** : `dealzone_db`
   - **Owner** : `postgres` (ou ton user)
3. Onglet **Definition** (laisse les défauts, Encoding UTF8)
4. Clique **Save**

Tu dois voir `dealzone_db` dans la liste des bases.

---

# ÉTAPE 3 — Exécuter le schéma SQL

1. Clic gauche sur **`dealzone_db`** pour la sélectionner
2. Clique l’icône **Query Tool** (outil requête) en haut  
   (ou clic droit sur `dealzone_db` → Query Tool)
3. Ouvre le fichier :
   ```
   Desktop\nextjs\DealZone\docs\database\schema-dealzone.sql
   ```
   - Dans Query Tool : icône dossier / Open File  
   - Ou copie-colle tout le contenu du fichier
4. Clique **Execute / Run** (icône ▶ ou F5)
5. En bas : message du type **Success** / Query returned successfully

### Vérification rapide

Dans le même Query Tool, exécute :

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Tu dois voir :

- `categories`
- `company_settings`
- `products`
- `stock_movements`
- `suppliers`
- `users`

---

# ÉTAPE 4 — Charger les données de démo (optionnel mais recommandé)

1. Toujours dans Query Tool sur `dealzone_db`
2. Ouvre / colle :
   ```
   Desktop\nextjs\DealZone\docs\database\seed-dealzone.sql
   ```
3. Exécute (▶ / F5)

### Vérification

```sql
SELECT * FROM v_dashboard_summary;
SELECT sku, name, quantity, stock_status FROM v_products_stock_status;
SELECT email, role FROM users;
```

---

# ÉTAPE 5 — Noter ta chaîne de connexion

Remplace `TON_MOT_DE_PASSE` par le mot de passe de l’utilisateur `postgres` :

```env
DATABASE_URL="postgresql://postgres:TON_MOT_DE_PASSE@localhost:5432/dealzone_db"
```

Exemple (si mdp = `admin123`) :

```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/dealzone_db"
```

> Port par défaut PostgreSQL : **5432**  
> Si tu as changé le port à l’install, adapte.

Garde cette ligne : on la mettra dans `.env` au moment du projet Next.js.

---

# ÉTAPE 6 — Préparer le dossier DealZone pour Next.js

Pour l’instant le dossier contient surtout la doc.  
Quand on passera au code, on fera :

```bash
cd Desktop/nextjs/DealZone
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
```

**Ne lance pas encore cette commande** si tu n’es pas prêt — on le fera ensemble à la phase 1 pour ne pas écraser `docs/`.

Checklist avant le code :

- [ ] PostgreSQL service démarré
- [ ] pgAdmin accessible
- [ ] Base `dealzone_db` créée
- [ ] `schema-dealzone.sql` exécuté avec succès
- [ ] (Optionnel) seed exécuté
- [ ] `DATABASE_URL` notée quelque part (bloc-notes)

---

# ÉTAPE 7 — Outils déjà OK (rien à faire)

| Outil | Version détectée | Action |
|-------|------------------|--------|
| Node.js | v24.17.0 | Aucune |
| npm | 11.13.0 | Aucune |
| Git | 2.54 | Aucune |
| PostgreSQL | 18 | Configurer base seulement |
| pgAdmin 4 | Inclus | Utiliser pour SQL |

Plus tard (avec le code) on installera via npm :

- Next.js / React
- Tailwind + DaisyUI
- Prisma
- Zod / Auth / bcrypt…

---

# Problèmes fréquents

### “password authentication failed for user postgres”
→ Mauvais mot de passe. Réessaie ou reset du mot de passe Postgres.

### “Connection refused” / serveur injoignable
→ Service PostgreSQL arrêté → `services.msc` → démarrer.

### Erreur en exécutant le schéma (“type already exists”, etc.)
→ Normal si tu relances le script : les `IF NOT EXISTS` / blocs `DO` protègent.  
Si la base est cassée : drop `dealzone_db` et recommence étapes 2–4.

### pgAdmin ne s’ouvre pas / reste sur “Loading”
→ Attends 30–60 s (premier lancement lent), ou redémarre pgAdmin en admin.

### Caractères bizarres dans SQL
→ Ouvre les fichiers `.sql` en UTF-8 dans Query Tool (Open File plutôt que copier depuis un éditeur mal encodé).

---

# Où tu en es / suite

**Maintenant :** fais les étapes **0 → 5** (Postgres + pgAdmin + base + schéma).  
**Ensuite :** dis-moi “Étape 5 OK” (et si le seed a marché) → on lance la **phase 1** (création app Next.js + Tailwind + DaisyUI + logo + login).

---

## Récap ultra-court

1. Démarrer service PostgreSQL  
2. Ouvrir pgAdmin → se connecter  
3. Créer `dealzone_db`  
4. Exécuter `schema-dealzone.sql`  
5. Exécuter `seed-dealzone.sql`  
6. Noter `DATABASE_URL`  
7. Revenir me dire que c’est bon  

# Base de données DealZone (PostgreSQL)

## Fichiers

| Fichier | Rôle |
|---------|------|
| `schema-dealzone.sql` | Schéma complet (tables, enums, index, triggers, vues) |
| `seed-dealzone.sql` | Données de démonstration |

## Installation dans pgAdmin

1. Ouvre pgAdmin → connecte-toi au serveur PostgreSQL.
2. Crée la base **`dealzone_db`** (clic droit Databases → Create → Database).
3. Ouvre Query Tool sur `dealzone_db`.
4. Exécute **`schema-dealzone.sql`** en entier.
5. (Optionnel) Exécute **`seed-dealzone.sql`** pour les données démo.

## Connexion app (.env)

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/dealzone_db"
```

## Diagramme relationnel

```
users ───────────────┐
                     │
categories ──┐       │
             ├── products ──── stock_movements
suppliers ───┘                     │
                                   │
                              (user_id)

company_settings (singleton)
```

## Tables (6)

1. **users** — comptes + rôles `ADMIN | GESTIONNAIRE | MAGASINIER`
2. **categories** — catégories produits
3. **suppliers** — fournisseurs
4. **products** — catalogue + stock courant (`quantity`)
5. **stock_movements** — historique `IN | OUT | ADJUST`
6. **company_settings** — paramètres entreprise (devise XOF, etc.)

## Vues

- **v_products_stock_status** — statut OK / BAS / RUPTURE + valeur stock
- **v_dashboard_summary** — KPI dashboard

## Comptes seed (après hash réel côté app)

| Email | Rôle |
|-------|------|
| admin@dealzone.local | ADMIN |
| gestionnaire@dealzone.local | GESTIONNAIRE |
| magasinier@dealzone.local | MAGASINIER |

Mot de passe prévu : `Password123!` (hash à générer avec bcrypt dans Next.js).

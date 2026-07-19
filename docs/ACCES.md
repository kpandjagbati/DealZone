# Accès DealZone

La plateforme démarre **vide** (pas de produits, catégories, fournisseurs ni mouvements).

Seul le compte Admin est créé pour permettre la première connexion.

| Rôle | Email | Mot de passe |
|------|--------|--------------|
| **Administrateur** | `admin@dealzone.local` | `Password123!` |

Ensuite, c’est toi qui saisis toutes les données :
1. Connecte-toi en Admin
2. Crée les Gestionnaires / Magasiniers
3. Ajoute catégories, fournisseurs, produits, mouvements, etc.

Pour réinitialiser la base (vide + Admin uniquement) :

```bash
npm run db:seed
```

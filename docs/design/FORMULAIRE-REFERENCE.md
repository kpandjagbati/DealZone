# Référence design — Formulaires (DealZone)

> Source visuelle : `formulaire-reference.png`  
> À respecter pour **tous** les écrans auth et formulaires de l’app.

---

## Palette

> **Marque officielle** = logo DealZone (`LOGO-REFERENCE.md`) : navy + orange.  
> La maquette ci-dessous montrait du vert : on **garde la structure** des formulaires, on **applique les couleurs logo**.

| Token | Usage | Valeur indicative |
|-------|--------|-------------------|
| `--brand-primary` | Titres forts, textes brand | Navy `#0A1628` (logo “Deal”) |
| `--brand-accent` | Bouton principal / CTA | Orange `#FF6600` (logo “zone”) |
| `--brand-accent-soft` | Bouton secondaire, progress | Orange clair / lime de maquette si besoin |
| `--surface` | Fond page | Blanc `#FFFFFF` |
| `--input-bg` | Fond champs | Blanc |
| `--input-border` | Bordure champs | Gris clair `#E5E7EB` |
| `--muted` | Texte secondaire, placeholders | Gris moyen `#9CA3AF` |
| `--guest-bg` | Bouton “guest” / neutre | Gris très clair `#F3F4F6` |
| `--text` | Corps de texte | Gris foncé `#4B5563` |

---

## Forme & style (règles dures)

1. **Champs et boutons = pill** : `rounded-full` partout (inputs + buttons).
2. **Fond clair**, minimaliste, beaucoup d’espace vertical.
3. **Icônes à gauche** dans les inputs (email, lock, etc.).
4. **Mot de passe** : icône œil à droite (show/hide).
5. **Bouton principal** : fond `--brand-accent` (orange), texte blanc, pleine largeur, pill.
6. **Boutons sociaux / secondaires** : pill, icône à gauche, label centré.
7. Typo sans-serif moderne, titres **bold** en navy, centrés sur les écrans auth.

---

## Structure écran Login (référence principale)

```
[ Titre "Login" — bold, navy, centré ]

[ Input Email     — icône enveloppe à gauche ]
[ Input Password  — icône cadenas à gauche + œil à droite ]
[ Forgot Password? — aligné à droite, souligné ]

[ Bouton Login — orange marque, full width ]

[ ──── or ──── ]

[ Continue with Google — blanc + bordure ]
[ Continue with Apple  — accent soft ]
[ Continue As Guest    — guest-bg ]

[ Need an account? Sign up ]
```

### Champs

| Champ | Type | Placeholder | Icône gauche | Icône droite |
|-------|------|-------------|--------------|--------------|
| Email | email | Email | enveloppe | — |
| Password | password | Password | cadenas | œil (toggle) |

### Actions

| Élément | Style |
|---------|--------|
| Login | Pill, orange marque, texte blanc |
| Forgot Password? | Lien gris, souligné, à droite |
| Continue with Google | Pill, blanc, bordure grise |
| Continue with Apple | Pill, accent soft |
| Continue As Guest | Pill, gris clair |
| Sign up / Log in | Lien bold dans le footer |

---

## Structure écran Onboarding / Welcome (optionnel)

```
[ Illustration centrée ]
[ Titre bold ]
[ Sous-titre gris centré ]
[ Progress bar 3 segments ]
[ Boutons Google / Apple / Guest ]
[ Already have an account? Log in ]
```

---

## Adaptation DealZone

Pour l’app DealZone (gestion de stock), **conserver le même langage visuel** :

- Login / Register : reprendre ce layout tel quel (adapter les labels en français).
- Autres formulaires (produit, mouvement, fournisseur…) :
  - mêmes pills `rounded-full`
  - mêmes couleurs brand
  - icônes à gauche quand pertinent
  - bouton submit = style “Login” (orange marque)
  - champs secondaires / cancel = style neutre (gris clair ou bordure)

### Labels FR prévus (auth)

- Login → **Connexion**
- Email → **Email**
- Password → **Mot de passe**
- Forgot Password? → **Mot de passe oublié ?**
- Need an account? Sign up → **Pas de compte ? S’inscrire**
- Already have an account? Log in → **Déjà un compte ? Se connecter**

> Note : Google / Apple / Guest — à décider plus tard (V1 possible : email/mot de passe uniquement, en gardant le style des boutons si on les active).

---

## Checklist implémentation

- [ ] Variables CSS / thème DaisyUI alignés sur navy + orange (logo)
- [ ] Logo DealZone au-dessus du formulaire login
- [ ] Inputs `rounded-full` + padding gauche pour icônes
- [ ] Toggle visibilité mot de passe
- [ ] Bouton primaire orange full-width
- [ ] Séparateur “or” / “ou”
- [ ] Footer lien inscription / connexion
- [ ] Responsive mobile-first (maquette mobile = référence)

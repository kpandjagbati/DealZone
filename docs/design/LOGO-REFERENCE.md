# Identité visuelle — Logo DealZone

> Fichier source : `logo-dealzone.png`  
> Fond transparent / noir selon usage. À utiliser en hero brand, navbar, splash, favicon.

---

## Composition

- **Deal** (ligne du haut) — bleu marine très foncé, bold sans-serif  
  - Le **D** intègre une **étiquette prix** orange (percée)
- **zone** (ligne du bas) — orange vif, bold sans-serif, minuscules  
  - Le **o** est remplacé par un **pin de localisation** orange  
  - Petite ombre ovale bleu marine sous le pin

---

## Palette marque (issue du logo)

| Token | Usage | Valeur indicative |
|-------|--------|-------------------|
| `--dz-navy` | “Deal”, textes forts, ombre pin | Bleu marine `#0A1628` / `#001220` |
| `--dz-orange` | “zone”, icônes (tag + pin), accents CTA | Orange vif `#FF6600` / `#F97316` |
| `--dz-black` | Fond splash / contraste logo | `#000000` |
| `--dz-white` | Fonds clairs UI | `#FFFFFF` |

---

## Usages dans l’app

| Emplacement | Règle |
|-------------|--------|
| Navbar / sidebar | Logo compact + nom DealZone |
| Login / onboarding | Logo centré au-dessus du titre (brand hero) |
| Favicon / PWA | Version simplifiée (tag + pin ou monogramme) |
| Boutons primaires | Priorité **orange marque** (aligné logo) ; navy pour titres |

---

## Lien avec les formulaires

La maquette formulaire (`FORMULAIRE-REFERENCE.md`) définit la **structure** (pills, icônes, layout).  
Les **couleurs marque** viennent du logo :

- Bouton principal → `--dz-orange` (ou navy selon contraste)
- Titres / textes forts → `--dz-navy`
- Accents secondaires → orange clair / navy

> À trancher à l’implémentation : garder le vert de la maquette formulaire, ou basculer 100 % navy/orange logo.  
> **Recommandation** : navy + orange (cohérence brand DealZone).

---

## Checklist assets

- [x] `logo-dealzone.png` sauvegardé
- [ ] Copie dans `public/` au moment du scaffold Next.js
- [ ] Favicon dérivé
- [ ] Variante claire / sombre si besoin

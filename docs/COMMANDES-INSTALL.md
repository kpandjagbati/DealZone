# Commandes d’installation — DealZone

Copie-colle **dans l’ordre**, dans Git Bash ou le terminal Cursor.

> Le dossier `DealZone` contient déjà `docs/` → `create-next-app` va demander confirmation : réponds **Yes**.

---

## 1. Aller dans le dossier

```bash
cd "/c/Users/GbatiAristideKPANDJA/Desktop/nextjs/DealZone"
```

---

## 2. Créer l’app Next.js (TypeScript + Tailwind + App Router + src)

> **Important :** npm refuse les majuscules (`DealZone`).  
> On crée donc dans un dossier temporaire `dealzone-app`, puis on remonte les fichiers.

```bash
cd "/c/Users/GbatiAristideKPANDJA/Desktop/nextjs/DealZone"

npx create-next-app@latest dealzone-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --yes

# Remonter tout le contenu à la racine de DealZone
shopt -s dotglob
mv dealzone-app/* .
rmdir dealzone-app
```

Vérifie que `package.json` a bien `"name": "dealzone-app"` (minuscules = OK).  
Tu peux le renommer en `"dealzone"` si tu veux.
---

## 3. Installer DaisyUI + icônes

```bash
npm install daisyui react-icons
```

---

## 4. Installer Prisma + PostgreSQL client

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

---

## 5. Installer Auth + validation + hash mot de passe

```bash
npm install zod bcryptjs
npm install -D @types/bcryptjs
npm install next-auth@beta
```

> `next-auth@beta` = Auth.js v5 (compatible Next.js App Router).

---

## 6. (Optionnel) Utilitaires pratiques

```bash
npm install clsx date-fns
```

---

## 7. Configurer DaisyUI dans le CSS

Ouvre `src/app/globals.css` et remplace le contenu par :

```css
@import "tailwindcss";
@plugin "daisyui";

:root {
  --dz-navy: #0a1628;
  --dz-orange: #ff6600;
}
```

---

## 8. Configurer la base PostgreSQL (fichier `.env`)

Ouvre `.env` (créé par Prisma) et mets :

```env
DATABASE_URL="postgresql://postgres:TON_MOT_DE_PASSE@localhost:5432/dealzone_db?schema=public"
AUTH_SECRET="change-moi-par-une-longue-chaine-secrete"
```

Remplace `TON_MOT_DE_PASSE` par ton vrai mot de passe Postgres.

Génère un secret Auth :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie le résultat dans `AUTH_SECRET=...`

---

## 9. Vérifier que tout est installé

```bash
npm list next react react-dom tailwindcss daisyui @prisma/client prisma zod bcryptjs next-auth react-icons
```

---

## 10. Lancer le serveur de dev

```bash
npm run dev
```

Ouvre : [http://localhost:3000](http://localhost:3000)

---

## Récap tout-en-un (copier d’un bloc)

```bash
cd "/c/Users/GbatiAristideKPANDJA/Desktop/nextjs/DealZone"

npx create-next-app@latest dealzone-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --yes

shopt -s dotglob
mv dealzone-app/* .
rmdir dealzone-app

npm install daisyui react-icons zod bcryptjs next-auth@beta clsx date-fns
npm install -D prisma @types/bcryptjs
npm install @prisma/client

npx prisma init

npm run dev
```

Puis manuellement :
1. Éditer `src/app/globals.css` (DaisyUI)  
2. Éditer `.env` (`DATABASE_URL` + `AUTH_SECRET`)  
3. Créer `dealzone_db` dans pgAdmin + exécuter le SQL si pas déjà fait  

---

## Après l’install (plus tard, avec moi)

```bash
# Quand le schema.prisma sera prêt :
npx prisma migrate dev --name init
npx prisma db seed
npx prisma studio
```

---

## En cas d’erreur

| Erreur | Solution |
|--------|----------|
| Dossier non vide | Ajoute `--force` à create-next-app |
| `EACCES` / permission | Ferme les programmes qui lockent le dossier, relance le terminal |
| Port 3000 occupé | `npm run dev -- -p 3001` |
| Prisma DATABASE_URL | Vérifie mot de passe + que `dealzone_db` existe |

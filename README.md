# 🏷️ Leboncoin Price Tracker

Un **price tracker** pour [Leboncoin.fr](https://www.leboncoin.fr) : cherchez un
objet (ex. **RTX 5060**), récupérez toutes les offres contenant ce mot dans le
titre, avec **images, prix, localisation, catégorie et badges**, et parcourez
les **meilleures offres** dans un site web **style Apple (bleu & blanc)** avec
effet **frost / liquid glass** et animations soignées.

## 🌐 En ligne (GitHub Pages)

👉 **https://nuxsgit.github.io/lbc-pricetracker/**

Le site est un **export statique** déployé sur GitHub Pages (branche `build`).
La recherche et les filtres fonctionnent **côté client** sur l'instantané réel
d'annonces Leboncoin — aucune serveur requis.

![stack](https://img.shields.io/badge/Next.js-14-black) ![stack](https://img.shields.io/badge/TypeScript-React-blue) ![stack](https://img.shields.io/badge/Tailwind-3-38bdf8) ![stack](https://img.shields.io/badge/Framer%20Motion-11-ff0080)

## ✨ Fonctionnalités

- **Recherche** d'un objet sur Leboncoin avec barre de recherche frosted glass.
- **Collecte des offres** : titre, prix, image, localisation, catégorie,
  condition, frais de port, badges (À la une, Pro, Baisse de prix, Sponsorisé…).
- **Images réelles** Leboncoin affichées directement dans les cartes.
- **Meilleures offres** : tri intelligent qui met en avant l'offre la moins
  chère (hors échanges) avec badge « Meilleure offre » et glow.
- **Statistiques animées** (comptage progressif) : nombre d'offres, prix min,
  prix moyen, meilleure offre.
- **Filtres & tri** : tri (Meilleures offres / Prix croissant / Prix décroissant /
  Pertinence), fourchette de prix, filtre par catégorie.
- **Animations** : aurora liquid-glass en fond, blobs animés, entrées décalées
  des cartes, hover 3D, sheen sur le bouton, shimmer de chargement.
- **Accessibilité** : respect de `prefers-reduced-motion`.

## 🧱 Stack

- **Next.js 14** (App Router, export statique) + **React 18** + **TypeScript**
- **Tailwind CSS** pour le design system bleu/blanc Apple
- **Framer Motion** pour les animations
- **lucide-react** pour les icônes
- **cheerio** (référence, `lib/leboncoin.ts`) pour un fetch live côté serveur

## 🚀 Démarrage local

```bash
npm install
npm run dev      # http://localhost:3000
```

Build statique (produce le dossier `out/` pour GitHub Pages) :

```bash
npm run build    # génère out/ avec basePath /lbc-pricetracker
```

## 🧠 Architecture & données

Leboncoin n'expose **pas d'API publique** : son endpoint interne
`api.leboncoin.fr/finder/search` est protégé par **DataDome**. Ce projet est donc
un **export statique** déployable sur GitHub Pages :

- **Snapshot réel en cache** (`lib/data.ts`) : un ensemble d'annonces Leboncoin
  **réelles** (RTX 5060) collectées depuis la SSR de
  `leboncoin.fr/recherche`. Les images `img.leboncoin.fr` sont publiques et
  se chargent **directement dans le navigateur**.
- **Recherche côté client** (`searchCacheOffers`) : filtre du snapshot par mots-
  clés du titre. Aucun serveur nécessaire — le site est pleinement fonctionnel
  en static.
- **Fetch live** (`lib/leboncoin.ts`, référence) : un `GET` de la page de
  recherche SSR + parsing HTML avec cheerio pour récupérer des annonces en
  direct côté serveur. Ce chemin nécessite un hébergement Node capable de
  joindre `leboncoin.fr` (hors DataDome/réseau restreint).

> ⚠️ Le sandbox de développement ne peut pas atteindre `leboncoin.fr`, donc les
> données proviennent de l'instantané réel en cache. Sur un réseau qui peut
> joindre Leboncoin, le fetch live (référence `lib/leboncoin.ts`) peut être
> réactivé côté serveur.

## 📁 Structure

```
app/
  layout.tsx            # root layout, métadonnées
  page.tsx              # page principale (état, recherche, filtres, grille)
  globals.css           # frost glass, aurora, thème Apple
components/
  GlassBackground.tsx   # fond aurora animé
  SearchBar.tsx         # barre de recherche + suggestions
  StatsBar.tsx          # statistiques animées
  FilterBar.tsx         # tri + filtres
  OfferCard.tsx         # carte d'offre (image, badges, prix, lien)
  OfferImage.tsx        # image avec fallback
  Badges.tsx            # badges d'annonce
  Loader.tsx / EmptyState.tsx
lib/
  types.ts              # types partagés
  data.ts               # snapshot cache (annonces réelles) + recherche client
  leboncoin.ts          # référence fetch live + parsing cheerio
```

## 📦 Déploiement GitHub Pages

Le build statique est poussé sur la branche **`build`** (contenu de `out/`).

1. Lancer `npm run build` → génère `out/`.
2. Pousser les fichiers de `out/` sur la branche `build`.
3. Dans le repo GitHub → **Settings → Pages → Deploy from a branch** :
   - **Branch** : `build`
   - **Folder** : `/(root)`
4. La site est disponible à
   **https://nuxsgit.github.io/lbc-pricetracker/**.

## 📝 Détails

- Projet **non-officiel**, à but démonstratif. Les annonces, prix et images sont
  collectés depuis leboncoin.fr.
- Le tri « Meilleures offres » exclut les annonces « Échange » pour que le prix
  minimum reste significatif.

# For When I'm Gone

## Description du projet

Application Svelte 5 avec TypeScript qui génère une page HTML autonome (single-file) contenant tout le code HTML, JavaScript et CSS sans aucune dépendance externe.

## Stack technique

- **Framework** : Svelte 5 avec les runes ($state, $derived, $props, $effect)
- **Langage** : TypeScript
- **Build** : Vite 7 + vite-plugin-singlefile
- **Package manager** : pnpm (obligatoire)

## Structure du projet

```
src/
├── main.ts              # Point d'entrée
├── App.svelte           # Composant racine
├── app.css              # Styles globaux
├── vite-env.d.ts        # Types Vite
└── components/          # Composants réutilisables
    └── *.svelte
```

## Commandes principales

```bash
pnpm dev      # Développement
pnpm build    # Build → dist/index.html (fichier unique)
pnpm preview  # Prévisualiser le build
```

## Skills disponibles

Les skills sont dans `doc/skills/` :

- **svelte-component** : Comment créer un composant Svelte 5
- **build-single-file** : Comment fonctionne le build single-file
- **project-commands** : Référence des commandes pnpm

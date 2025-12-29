---
name: build-single-file
description: Générer une page HTML autonome contenant tout le code (HTML, JS, CSS) sans dépendances externes. Utiliser pour le build de production ou quand on parle de fichier unique.
---

# Build Single File HTML

Ce projet génère une page HTML autonome.

## Générer le fichier HTML unique

```bash
pnpm build
```

Le fichier généré se trouve dans `dist/index.html`.

## Configuration clé

Le fichier `vite.config.ts` utilise `vite-plugin-singlefile` pour :
- Inliner tout le JavaScript dans une balise `<script>`
- Inliner tout le CSS dans une balise `<style>`
- Produire un seul fichier HTML autonome

## Options de build importantes

```typescript
build: {
  target: 'esnext',           // Cible moderne
  assetsInlineLimit: 100000000, // Inline tous les assets
  cssCodeSplit: false,        // Pas de split CSS
}
```

## Limitations

- Les assets très volumineux (images, polices) augmentent la taille du fichier
- Préférer les assets en base64 ou les icônes SVG inline

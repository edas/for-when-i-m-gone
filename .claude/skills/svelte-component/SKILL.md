---
name: svelte-component
description: Créer un nouveau composant Svelte 5 avec TypeScript. Utiliser quand on demande de créer un composant, ajouter une fonctionnalité UI, ou structurer du code Svelte.
---

# Créer un composant Svelte

Quand on te demande de créer un composant Svelte :

## Emplacement

Créer le fichier dans `src/components/` avec l'extension `.svelte`

## Structure du composant

```svelte
<script lang="ts">
  // Props avec $props()
  let { propName = defaultValue }: { propName: Type } = $props()
  
  // État réactif avec $state()
  let count = $state(0)
  
  // Effets dérivés avec $derived()
  let doubled = $derived(count * 2)
</script>

<!-- Template HTML -->

<style>
  /* Styles scopés au composant */
</style>
```

## Conventions

- Utiliser `lang="ts"` dans le script
- Utiliser les runes Svelte 5 (`$state`, `$derived`, `$props`, `$effect`)
- Styles scopés par défaut
- Nommer le fichier en PascalCase (ex: `MonComposant.svelte`)

## Import

Ne pas oublier d'importer le composant là où il est utilisé.

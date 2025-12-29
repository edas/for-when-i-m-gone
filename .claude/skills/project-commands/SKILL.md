---
name: project-commands
description: Commandes pnpm et gestion des dépendances du projet. Utiliser quand on demande d'exécuter une commande, installer un paquet, ou lancer le serveur de dev.
---

# Commandes du projet

## Commandes pnpm

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Lance le serveur de développement avec hot reload |
| `pnpm build` | Génère `dist/index.html` (fichier unique autonome) |
| `pnpm preview` | Prévisualise le build de production |
| `pnpm check` | Vérifie les types TypeScript et Svelte |

## Gestionnaire de paquets

**Important** : Ce projet utilise `pnpm` exclusivement.

- Installer une dépendance : `pnpm add <package>`
- Installer une dev dependency : `pnpm add -D <package>`
- Mettre à jour : `pnpm update --latest`

Ne jamais utiliser `npm` ou `yarn`.

Quand tu ajoutes une nouvelle dépendance, toujours utiliser `pnpm add` au lieu de manipuler `package.json` à la main. Ne préciser la version qu'en cas de besoin. Mieux vaut omettre la version pour que ce soit la dernière qui soit installée.

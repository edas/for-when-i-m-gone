# For When I'm Gone

Application permettant de partager des secrets en toute sécurité grâce à l'algorithme du **Secret de Shamir** (*Shamir's Secret Sharing*).

## 🔐 Principe

Le partage de secret de Shamir est un algorithme cryptographique qui permet de diviser un secret en plusieurs parts, de telle sorte qu'un nombre minimum de parts (le *seuil*) soit nécessaire pour reconstituer le secret original. Aucune information sur le secret ne peut être obtenue avec moins de parts que le seuil requis.

**Exemple** : Vous pouvez diviser un secret en 5 parts avec un seuil de 3. N'importe quels 3 détenteurs de parts peuvent alors reconstituer le secret, mais 2 parts ou moins ne révèlent absolument rien.

## ✨ Fonctionnalités

- **Interface guidée** : L'application vous accompagne pas à pas dans la configuration des paramètres de partage
- **Paramètres configurables** :
  - Le secret à protéger
  - Le nombre total de parts à générer
  - Le seuil minimum de parts nécessaires pour la reconstitution
- **Fichiers autonomes** : Chaque fichier généré contient à la fois les données chiffrées ET la logique de déchiffrement
- **Aucune dépendance externe** : Les fichiers sont des pages HTML autonomes qui fonctionnent hors-ligne
- **Multilingue** : Interface disponible en français et en anglais

## 🚀 Utilisation

### Création des parts

1. Ouvrez l'application dans votre navigateur
2. Confirmez l'avertissement de sécurité (vérifiez que vous avez téléchargé depuis la source officielle)
3. Suivez les étapes de l'assistant :
   - Entrez votre secret
   - Choisissez le nombre total de parts
   - Définissez le seuil minimum requis
4. Téléchargez les fichiers générés
5. Distribuez chaque fichier à un destinataire différent

### Reconstitution du secret

1. Rassemblez le nombre minimum de parts requis
2. Ouvrez l'un des fichiers dans un navigateur
3. Entrez les données des autres parts
4. Le secret original est reconstitué

## 🛡️ Sécurité

- **Tout se passe localement** : Aucune donnée n'est envoyée sur internet
- **Fichiers autonomes** : La logique de déchiffrement est intégrée dans chaque fichier généré, éliminant le risque qu'un service distant devienne indisponible
- **Code source ouvert** : Vous pouvez auditer le code avant utilisation
- **Avertissement de sécurité** : L'application vérifie que vous l'avez téléchargée depuis la source officielle

## 🔧 Développement

### Prérequis

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)

### Installation

```bash
pnpm install
```

### Lancer le serveur de développement

```bash
pnpm dev
```

### Construire pour la production

```bash
pnpm build
```

Le fichier de production sera généré dans le dossier `dist/`. Grâce à `vite-plugin-singlefile`, tout est bundlé dans un seul fichier HTML autonome.

### Vérification TypeScript

```bash
pnpm check
```

## 📁 Structure du projet

```
for-when-i-m-gone/
├── src/
│   ├── App.svelte          # Composant principal
│   ├── components/         # Composants réutilisables
│   ├── lib/                # Utilitaires (i18n, crypto, etc.)
│   └── main.ts             # Point d'entrée
├── dist/                   # Fichiers de production
└── index.html              # Template HTML
```

## 📜 Licence

Ce projet est open source. Voir le fichier LICENSE pour plus de détails.

## 🙏 Remerciements

- [Adi Shamir](https://fr.wikipedia.org/wiki/Adi_Shamir) pour l'algorithme de partage de secret
- [Svelte](https://svelte.dev/) pour le framework
- [Vite](https://vitejs.dev/) pour l'outillage de build

# ChatGPT Visible Trace & Sources Exporter

Bookmarklet local pour exporter en Markdown les éléments déjà visibles dans l’interface web de ChatGPT :

- la trace visible de raisonnement, quand ChatGPT l’affiche ;
- les sources visibles dans le panneau `Sources` ;
- une liste dédupliquée de toutes les sources récupérées.

> Important : ce projet n’extrait pas la pensée interne brute du modèle. Il automatise uniquement la copie d’éléments déjà affichés dans l’interface utilisateur.

## Installation rapide

1. Affichez la barre des favoris de votre navigateur.
2. Créez un nouveau favori.
3. Donnez-lui un nom, par exemple `Export ChatGPT`.
4. Dans le champ URL du favori, collez le contenu complet de [`dist/bookmarklet.min.js`](dist/bookmarklet.min.js).
5. Ouvrez une conversation ChatGPT contenant une réponse avec sources ou trace visible.
6. Cliquez sur le favori.

Le bookmarklet ouvre automatiquement le panneau latéral `Sources` quand il est disponible, récupère la trace visible et les liens affichés, puis ouvre une fenêtre de prévisualisation Markdown.

## Pourquoi une version minifiée ?

La version minifiée est indispensable pour l’usage en favori navigateur : un bookmarklet doit tenir dans le champ URL du favori et commencer par `javascript:`.

Ce dépôt contient donc deux versions :

- [`src/bookmarklet.js`](src/bookmarklet.js) : version lisible et auditable ;
- [`dist/bookmarklet.min.js`](dist/bookmarklet.min.js) : version prête à copier-coller dans la barre des favoris.

## Usage

Une fois le favori installé :

1. Posez une question à ChatGPT.
2. Utilisez une réponse qui affiche des sources ou une trace visible.
3. Cliquez sur le favori `Export ChatGPT`.
4. Choisissez :
   - `Trace visible + sources` ;
   - `Sources uniquement`.
5. Copiez le Markdown ou téléchargez le fichier `.md`.

## Confidentialité

Le script s’exécute localement dans votre navigateur.

Il ne contient :

- aucun appel à une API externe ;
- aucun envoi de données vers un serveur ;
- aucun tracker ;
- aucun stockage distant.

## Limites

Ce projet dépend de l’interface web de ChatGPT.

Il peut cesser de fonctionner si :

- OpenAI modifie les sélecteurs HTML/CSS ;
- le bouton `Sources` change de nom ou de structure ;
- la trace visible n’est pas affichée dans la réponse courante ;
- le navigateur bloque l’accès au presse-papiers.

## Note éthique

Cet outil n’a pas pour objectif d’accéder à des informations cachées, privées ou internes au modèle.

Il automatise seulement la copie d’éléments déjà affichés dans l’interface utilisateur : sources, liens et éventuelle trace visible de raisonnement.

Ne l’utilisez pas pour exporter des conversations contenant des données sensibles, personnelles ou confidentielles.

## Non-affiliation

Projet indépendant, non affilié à OpenAI.

## Développement

La source lisible est dans `src/bookmarklet.js`.

Pour régénérer la version minifiée avec Terser :

```bash
npm install
npm run build
```

## Licence

MIT.

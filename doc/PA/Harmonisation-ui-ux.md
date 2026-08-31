# Plan — Harmonisation UI/UX

## Objectif

Reconstruire la couche de présentation de l'application à partir d'une stratégie design commune, sans modifier la logique métier, les données ni les comportements fonctionnels existants.

Le résultat attendu est une interface homogène sur toutes les routes, fondée sur une palette bleu nuit, des composants partagés et des règles UX explicites.

## Constat initial

L'application contient actuellement plusieurs directions visuelles :

- `/` utilise principalement une interface compacte fondée sur les couleurs `gray` ;
- `/aidd`, `/aidd/config` et `/aidd/[profileId]/[axis]` utilisent principalement les couleurs `stone` ;
- `/` et `/aidd` proposent deux interfaces d'évaluation différentes ;
- plusieurs composants répètent directement de longues listes de classes Tailwind ;
- les largeurs, espacements, headers, cartes et hiérarchies typographiques ne sont pas uniformes ;
- certains layouts utilisent des largeurs fixes qui doivent être auditées pour le responsive ;
- les états vide, chargement, erreur et résultat ne suivent pas encore un système visuel commun.

## Périmètre de l'audit UX

Analyser les routes et états suivants :

- `/` ;
- `/aidd` ;
- `/aidd/config` ;
- `/aidd/[profileId]/[axis]` ;
- page d'erreur ;
- page introuvable ;
- états vide, chargement, erreur et résultat de chaque parcours concerné.

Pour chaque route, documenter :

- son objectif principal ;
- ses actions principales et secondaires ;
- son ordre de lecture ;
- ses composants ;
- ses données et comportements à conserver ;
- ses incohérences visuelles ;
- ses problèmes d'accessibilité ;
- son comportement selon la largeur disponible ;
- les duplications avec les autres routes.

## Décision fonctionnelle validée

`/` est l'ancienne version de l'interface d'évaluation. `/aidd` est la version fonctionnelle la plus récente et constitue la source de vérité comportementale pour la reconstruction.

La reconstruction doit donc :

- conserver les comportements de `/aidd` ;
- ne pas reprendre les choix UI/UX de `/` ;
- remplacer `/aidd` après validation de la nouvelle interface ;
- transformer `/` en redirection vers la nouvelle route d'évaluation lors de la bascule finale ;
- supprimer le code de l'ancienne interface `/` après la bascule.

## Stratégie design

### Couleurs

Centraliser dans `globals.css` des couleurs sémantiques :

- `app` pour le fond général ;
- `surface` pour les surfaces principales ;
- `surface-muted` pour les surfaces secondaires ;
- `primary` pour les actions principales ;
- `border` pour les séparations ;
- `text` pour le contenu principal ;
- `text-muted` pour le contenu secondaire.

La palette principale doit utiliser des bleus nuit et des bleus froids. Les couleurs associées aux `level` et aux états fonctionnels restent distinctes, car elles portent une information métier.

### Fondations visuelles

Définir avant la reconstruction des pages :

- la typographie ;
- l'échelle des tailles de texte ;
- l'échelle des espacements ;
- les rayons de bordure ;
- les ombres ;
- les largeurs maximales de contenu ;
- les breakpoints et comportements responsive ;
- les styles `hover`, `focus`, `active` et `disabled` ;
- les règles de contraste et de lisibilité.

## Composants partagés

Construire un système minimal de composants avant de reconstruire les pages :

- `AppShell` ;
- `AppHeader` ;
- `PageHeader` ;
- `Section` ;
- `Card` ;
- `Badge` ;
- `Button` ;
- `NumberInput` ;
- `EmptyState` ;
- `ErrorState` ;
- `LoadingState`.

Chaque composant doit :

- avoir une responsabilité visuelle précise ;
- utiliser les couleurs sémantiques globales ;
- exposer uniquement les variantes réellement nécessaires ;
- inclure les comportements clavier et attributs d'accessibilité requis ;
- éviter la duplication de longues listes de classes dans les pages.

Les conventions de nommage définitives devront être vérifiées dans le code avant création des fichiers.

## Stratégie de reconstruction

Conserver l'interface existante pendant la conception et construire temporairement les nouvelles pages sur des routes de prévisualisation :

```text
/ui-preview/evaluation
/ui-preview/config
/ui-preview/axis
```

Cette approche permet :

- de comparer l'ancien et le nouveau rendu ;
- de valider les fondations visuelles avant la bascule ;
- de tester les différents états sans dégrader les parcours existants ;
- de supprimer les anciennes implémentations uniquement après validation.

Les routes de prévisualisation sont temporaires et doivent être supprimées après la migration.

Cette stratégie doit être validée avant implémentation. L'alternative consiste à remplacer directement chaque page au fur et à mesure.

## Ordre de reconstruction

1. Réaliser l'audit UX en utilisant `/aidd` comme source de vérité comportementale.
2. Valider la palette, la typographie, les espacements et les comportements responsive.
3. Construire les composants partagés.
4. Reconstruire `/aidd/config` pour valider le système visuel sur une page avec peu d'états.
5. Reconstruire la liste et la sélection des profils.
6. Reconstruire le dashboard d'évaluation.
7. Reconstruire le détail d'un axe.
8. Harmoniser les états vide, chargement, erreur et page introuvable.
9. Valider l'accessibilité, le responsive et les parcours fonctionnels.
10. Basculer les routes finales.
11. Supprimer les routes de prévisualisation, les anciennes interfaces et le code devenu inutilisé.

## Critères d'harmonisation

Toutes les pages finales doivent partager :

- le même `AppHeader` ;
- la même logique de largeur et d'alignement ;
- la même hiérarchie de titres ;
- les mêmes surfaces, bordures et ombres ;
- les mêmes boutons, badges et champs ;
- les mêmes espacements verticaux ;
- les mêmes états interactifs ;
- une navigation cohérente ;
- un comportement responsive documenté ;
- des états vide, chargement et erreur cohérents.

## Contraintes

- Ne pas modifier la logique métier pendant la reconstruction UI/UX.
- Conserver les données et comportements fonctionnels existants jusqu'à décision explicite contraire.
- Ne pas modifier la terminologie provenant du code.
- Ne pas supprimer l'ancienne interface avant validation de son remplacement.
- Ne pas laisser de route de prévisualisation ou de composant temporaire après la bascule finale.

## Validation

Avant l'implémentation, valider explicitement :

- la stratégie par routes de prévisualisation ou par remplacement direct ;
- les fondations visuelles ;
- les composants partagés à créer ;
- l'ordre de migration.

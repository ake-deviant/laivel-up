# Audit UI/UX — Existant

## Source de vérité

`/aidd` est la version fonctionnelle la plus récente. `/` est une ancienne interface et ne doit pas servir de référence pour la reconstruction.

## Parcours principal

Le parcours de référence est le suivant :

1. consulter la liste des profils ou saisir un `profileId` ;
2. lancer l'évaluation ;
3. lire le `overallLevel` et les cinq axes ;
4. consulter les données non collectées et les pistes de progression ;
5. ouvrir le détail d'un axe ;
6. ajuster la configuration d'évaluation ;
7. relancer une évaluation avec cette configuration.

## `/aidd`

### Objectif

Sélectionner et évaluer un profil, puis expliquer son `overallLevel`.

### Comportements à conserver

- saisie manuelle d'un `profileId` ;
- chargement d'un profil depuis le paramètre `profile` ;
- liste des profils disponibles ;
- appel `POST /api/evaluate/[profileId]` avec `EvaluationConfig` ;
- affichage des erreurs de l'API ;
- affichage du `overallLevel`, des axes, des warnings, des données non collectées, des pistes et des `improvementOpportunities` ;
- navigation vers `/aidd/config` ;
- navigation vers le détail d'un axe.

### Problèmes UX observés

- le header concentre navigation, liste des profils, saisie et action principale ;
- l'action `Profils` masque ou affiche une zone éloignée du bouton ;
- la hiérarchie d'information devient très longue après l'évaluation ;
- le texte affirme que les cinq axes fixent le `level`, alors que des axes peuvent être non-bloquants ;
- les cartes utilisent plusieurs traitements visuels sans système commun ;
- les grilles et le conteneur de `1180px` ne s'adaptent pas explicitement aux petits écrans ;
- les états de chargement sont principalement exprimés par le texte du bouton ;
- la configuration active n'est pas visible dans le contexte du résultat.

## `/aidd/config`

### Objectif

Modifier `nonBlockingAxes`, `parallelismWeights`, `harnessContextWeights` et `harnessAiWeights`.

### Comportements à conserver

- persistance dans `localStorage` ;
- sélection de chaque axe bloquant ou non-bloquant ;
- saisie de poids entiers positifs ;
- retour vers `/aidd`.

### Problèmes UX observés

- aucune confirmation explicite de la sauvegarde automatique ;
- aucune indication sur l'effet de la configuration sur une évaluation déjà affichée ;
- les groupes de poids sont longs et visuellement uniformes ;
- la page ne dispose pas d'une navigation globale partagée ;
- le conteneur fixe et les cinq colonnes ne prévoient pas de comportement responsive ;
- les champs numériques n'expliquent pas leur unité ni leur portée.

## `/aidd/[profileId]/[axis]`

### Objectif

Expliquer le résultat d'un axe et distinguer les données collectées des données non collectées.

### Comportements à conserver

- évaluation du `profileId` ;
- sélection de l'axe depuis la route ;
- retour vers le profil évalué ;
- affichage du `level`, des signaux et des groupes de champs ;
- gestion des erreurs et du chargement.

### Problèmes UX observés

- header distinct de celui de `/aidd` ;
- largeur de contenu différente ;
- navigation limitée à un lien de retour ;
- hiérarchie des informations peu reliée au dashboard principal ;
- comportement responsive non défini.

## Pages d'erreur et page introuvable

### Comportements à conserver

- message explicite ;
- retour vers l'évaluation.

### Problèmes UX observés

- absence du shell et de la navigation de l'application ;
- aucune distinction entre une erreur récupérable et une erreur bloquante ;
- traitement visuel isolé du reste de l'application.

## Duplication et cohérence

- logos et headers sont implémentés directement dans plusieurs composants ;
- largeurs, sections, boutons et badges sont recréés localement ;
- `stone`, `gray` et des couleurs codées en dur coexistent ;
- les états interactifs n'utilisent pas une API de composants commune ;
- les routes métier importent des composants de présentation fortement couplés à leur page.

## Contraintes responsive retenues

- mobile : une colonne, navigation simplifiée, actions principales toujours visibles ;
- tablette : une ou deux colonnes selon la densité du contenu ;
- desktop : largeur maximale commune, jusqu'à cinq colonnes uniquement pour les contrôles courts ;
- aucune largeur fixe sans limite fluide ;
- aucune action essentielle ne doit dépendre du survol.

## Conclusion

La reconstruction doit conserver le parcours et les données de `/aidd`, remplacer les structures visuelles locales par un shell et des composants partagés, puis supprimer l'ancienne interface `/` après validation et bascule.

# Reprise — détection des opportunités d’amélioration

Objectif : détecter et afficher les modifications d’un seul champ capables de faire progresser le niveau d’un profil, en classant les gains les plus importants.

État actuel :

- `ImprovementOpportunityService` existe et est branché au use case et au ViewModel.
- `ImprovementFieldDefinitionRegistry` existe.
- Le cas TDD d’Arthur est couvert pour `harness` : `memoryCount` simulé seul fait passer `Red` à `Copper` (`levelGain: 3`).
- L’UI affiche les opportunités à fort impact dans « Ce qui débloque la suite ».
- Les interfaces `IImprovementOpportunityService` et `IAxisImprovementOpportunityDetector<TProfile>` existent.

Reste à faire :

- brancher réellement `size`, `intervention` et `parallelism` ;
- utiliser les calculators et configurations déjà présents pour chaque axe ;
- respecter les contraintes propres aux ratios, valeurs dérivées, seuils et conditions ;
- recalculer l’`overallLevel` pour chaque simulation ;
- ajouter les tests TDD par axe et vérifier le classement des opportunités ;
- compléter l’affichage si de nouveaux champs sont ajoutés.

Ne pas créer une nouvelle grille de levels : réutiliser le référentiel et les configurations existants.

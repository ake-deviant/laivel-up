# Résumé de la session

L’application utilise désormais les nouvelles pages sur les routes principales : évaluation sur `/`, liste des profils sur `/profiles`, configuration sur `/config` et détail d’un axe sur `/{profileId}/{axis}`. Les anciennes pages et anciennes URL ont été retirées. L’interface a été harmonisée autour d’une palette bleu nuit et de composants partagés.

La configuration permet de définir les axes bloquants, de restaurer les valeurs initiales et de choisir plusieurs algorithmes pour certains axes. Les choix sont conservés dans le navigateur et transmis à chaque évaluation.

Trois axes proposent maintenant deux implémentations :

- `parallelism` : calcul pondéré ou médiane uniquement ;
- `harness` : scores cumulés ou capacités obligatoires ;
- `size` : distribution dominante ou taille moyenne pondérée.

Le nouvel algorithme `size` prend en compte toute la distribution des tailles de PR et utilise des seuils configurables. Il respecte le contrat existant, possède son détecteur de signaux et reste éjectable. L’algorithme historique demeure la valeur par défaut.

La persistance de la configuration a été fiabilisée : les anciennes valeurs sont migrées, le détail d’un axe attend désormais le chargement de la configuration avant d’évaluer, et les changements provenant d’un autre onglet sont synchronisés. Le panneau JSON temporaire de diagnostic a été retiré après validation.

État de validation : 254 tests métier passent et le lint complet est propre. Les changements réalisés après le dernier commit ne sont pas encore commités.

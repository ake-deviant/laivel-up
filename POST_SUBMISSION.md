# Modifications après le rendu officiel

Le rendu officiel du hackathon correspond au commit `4c046f0`.

Le commit `c209fbd`, intitulé `chore: apply fixes after official submission`, a été créé après la clôture afin de documenter et corriger des problèmes de reproductibilité découverts lors d'un audit technique.

## Pourquoi ces changements ont été ajoutés

Le build de l'application Next.js et les 258 tests réussissaient, mais le build autonome du workspace `@laivel-up/core` échouait. Un ancien mapper inutilisé importait un type supprimé, et le build de production compilait également du code fictif volontairement incomplet présent dans les fixtures de test.

Le dépôt n'expliquait pas non plus assez clairement comment fournir les profiles à l'application. Les données réelles sont exclues de Git, mais la variable `PROFILES_BASE_DIR`, la structure attendue et la procédure permettant d'installer un profile fictif n'étaient pas décrites de manière reproductible.

Les changements postérieurs au rendu officiel ont donc :

- supprimé le mapper obsolète ;
- exclu `src/tests` du build de production de `@laivel-up/core` ;
- ajouté un `.env.example` pour `PROFILES_BASE_DIR` ;
- ajouté une procédure complète d'installation et d'injection des profiles ;
- corrigé la documentation du threshold `parallelism.gold`, passé de `20` à `30` dans le code avant le rendu ;
- ajouté le rapport ayant permis d'identifier ces écarts.

Ces corrections ne modifient pas rétroactivement le contenu du rendu officiel. Cette note permet de distinguer explicitement l'état évalué de l'état maintenu après la soumission.

## Injecter les données des profiles

La procédure complète se trouve dans [`doc/profiles.md`](doc/profiles.md).

Le principe est le suivant :

1. définir `PROFILES_BASE_DIR` dans `packages/app-nextjs/.env.local` ;
2. placer chaque profile dans un sous-dossier direct de ce répertoire ;
3. placer `profile.json` à la racine du dossier du profile ;
4. ajouter les autres sources JSON ou Markdown attendues ;
5. redémarrer Next.js et vérifier `/api/profiles`.

Une configuration locale standard peut être créée avec :

```powershell
Copy-Item packages\app-nextjs\.env.example packages\app-nextjs\.env.local
New-Item -ItemType Directory -Force -Path data\profiles\profiles
Copy-Item packages\core\src\tests\fixtures\profiles\bohort data\profiles\profiles\bohort -Recurse
```

Le fichier `.env.example` configure ce chemin par défaut :

```dotenv
PROFILES_BASE_DIR=../../data/profiles/profiles
```

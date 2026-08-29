# 2026-08-27 — Préparation avant kickoff

Hackathon Laivel Up — kickoff demain 12h.

## Ce qui a été fait

- Clonage de l'archétype frontend clean architecture
- Suppression des apps Angular et React, conservation de Next.js 15
- Migration Jest → Vitest
- Installation Tailwind v4 et Zod
- Structure de dossiers clean architecture prête
- `ZodProfileParser` dans `core/infrastructure`, Zod découplé de Next.js
- Premier test écrit et passant : `ZodProfileParser` (4 cas)
- Données de test centralisées pour survivre aux changements de schéma

## Décisions architecturales

- Algorithme de scoring déterministe (pas de LLM) pour des résultats reproductibles et explicables
- Port `IProfileEvaluator` dans le domain — implémentation `RuleBasedEvaluator` en infrastructure
- Parser Zod découplé derrière un port `IProfileParser`
- Object Mother pattern pour les fixtures de test
- InMemoryRepository pour les tests, Docker JSON Server pour le dev

## En attente

Schéma des données et critères d'évaluation officiels — fournis au kickoff demain 12h.


PS C:\WORKSPACE\5.Laivel-up\frontend-clean-archetype> git pull         
remote: Enumerating objects: 1, done.
remote: Counting objects: 100% (1/1), done.
remote: Total 1 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
Unpacking objects: 100% (1/1), 915 bytes | 457.00 KiB/s, done.
From https://github.com/ake-deviant/laivel-up
   390c1c7..7ca9828  main       -> origin/main
There is no tracking information for the current branch.
Please specify which branch you want to merge with.
See git-pull(1) for details.

    git pull <remote> <branch>

If you wish to set tracking information for this branch you can do so with:

    git branch --set-upstream-to=origin/<branch> main

PS C:\WORKSPACE\5.Laivel-up\frontend-clean-archetype> git checkout main
Switched to branch 'main'
PS C:\WORKSPACE\5.Laivel-up\frontend-clean-archetype> git pull
There is no tracking information for the current branch.
Please specify which branch you want to merge with.
See git-pull(1) for details.

    git pull <remote> <branch>

If you wish to set tracking information for this branch you can do so with:

    git branch --set-upstream-to=origin/<branch> main

PS C:\WORKSPACE\5.Laivel-up\frontend-clean-archetype>  git pull <remote> <branch>
Au caractère Ligne:1 : 11
+  git pull <remote> <branch>
+           ~
L’opérateur « < » est réservé à une utilisation future.
Au caractère Ligne:1 : 20
+  git pull <remote> <branch>
+                    ~
L’opérateur « < » est réservé à une utilisation future.
    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException
    + FullyQualifiedErrorId : RedirectionNotSupported
 
PS C:\WORKSPACE\5.Laivel-up\frontend-clean-archetype>     git branch --set-upstream-to=origin/<branch> main
fatal: the requested upstream branch 'origin/<branch>' does not exist
hint:
hint: If you are planning on basing your work on an upstream
hint: branch that already exists at the remote, you may need to
hint: run "git fetch" to retrieve it.
hint:
hint: If you are planning to push out a new local branch that
hint: will track its remote counterpart, you may want to use
hint: "git push -u" to set the upstream config as you push.
hint: Disable this message with "git config set advice.setUpstreamFailure false"
PS C:\WORKSPACE\5.Laivel-up\frontend-clean-archetype>     git branch                                       
  chore/infra
  chore/prepare-project
  feat/infra-pipeline
  feat/size-level-calculator
* main
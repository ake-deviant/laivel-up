# Audit technique de Laivel Up

Date de l'audit : 31 août 2026

Périmètre : état local du dépôt au commit `4c046f0`, complété par les modifications locales visibles au moment de l'audit.

Angle d'analyse : maintenabilité, architecture, robustesse, testabilité, sécurité, documentation et reproductibilité.

> **Suivi après audit.** Les constats P0-1 et P1-2 ont été corrigés après leur identification : le build autonome de `@laivel-up/core` réussit, le mapper obsolète a été supprimé et la documentation utilise désormais `parallelism.gold = 30`. Le parcours d'installation des profiles et un `.env.example` ont aussi été ajoutés. Les autres constats restent à considérer selon leur statut dans le code.

## Synthèse exécutive

Le projet possède une base métier sérieuse : séparation entre `core` et Next.js, domaine typé, parsing Zod, stratégie `Result`, injection des calculateurs, tests nombreux et scoring déterministe. Les règles de calcul sont généralement isolées et les axes principaux disposent de tests de seuil et de cas limites.

Cependant, un audit automatisé exigeant remontera probablement quatre faiblesses majeures : le package `@laivel-up/core` ne compile pas seul, un clone public ne contient aucune donnée permettant de lancer une démonstration, le frontend et les routes API ne sont pas testés, et la documentation contredit le code sur le seuil `gold` de `parallelism`. La maintenabilité est également pénalisée par plusieurs fichiers centraux très volumineux et par l'ajout de `deliveryConfidence`, qui n'est pas intégré de manière aussi homogène que les axes historiques.

Appréciation globale : **architecture prometteuse, logique métier bien testée, mais livraison insuffisamment reproductible et chaîne de qualité incomplète**.

## Résultats vérifiés

| Contrôle | Résultat | Observation |
|---|---:|---|
| Tests `@laivel-up/core` | Réussi | 34 fichiers, 258 tests |
| Couverture `@laivel-up/core` | 92,50 % statements, 85,56 % branches | Mesure à interpréter avec prudence, car les fixtures sont incluses dans le périmètre |
| ESLint | Réussi | Aucun échec sur `packages/*/src/**/*.{ts,tsx}` |
| Build Next.js | Réussi | 6 pages générées, contrôles TypeScript réussis dans le contexte de l'app |
| Build autonome `@laivel-up/core` | **Échec** | Erreurs TypeScript dans un mapper obsolète et dans des fichiers de fixture |
| CI | Absente | Aucun workflow `.github/workflows` |
| Tests frontend/API | Absents | Aucun fichier de test dans `packages/app-nextjs` |

## Points forts

### 1. Séparation claire des responsabilités principales

Le découpage `domain`, `application`, `infrastructure` et `presentation` est lisible. Le package Next.js consomme le package `core` via son point d'entrée public. Le test `clean-architecture.spec.ts` formalise certaines règles de dépendance, ce qui est un bon signal pour un évaluateur automatique.

### 2. Scoring déterministe et configurable

Les calculateurs reçoivent leurs seuils ou stratégies. `size`, `harness` et `parallelism` proposent plusieurs algorithmes sans introduire de LLM dans le verdict. Cette propriété facilite la reproductibilité des résultats et les tests de régression.

### 3. Couverture métier étendue

Les 258 tests couvrent les calculateurs, les signal detectors, les improvement opportunity detectors, le parsing, le mapping, le repository, le presenter et plusieurs profils complets. Les frontières de seuil sont largement testées. La validation de l'ordre strict des seuils `parallelism` est testée dans le domaine.

### 4. Gestion explicite des données manquantes

Les readiness checkers, le triage, les `FormatWarning` et les valeurs `null` évitent de confondre systématiquement absence de donnée et score nul. Cette distinction répond directement au critère de robustesse du hackathon.

### 5. Configuration isolée par requête

La configuration est transportée dans le body du `POST` et le container exécute l'évaluation dans un scope. Cela limite les risques de partage de configuration entre utilisateurs.

## Constats critiques — P0

### P0-1 — Le package `@laivel-up/core` ne compile pas seul

Commande vérifiée :

```text
npm run build --workspace=packages/core
```

Erreurs observées :

- `packages/core/src/infrastructure/mappers/developer-profile.mapper.ts:2` importe un `DeveloperProfileInput` qui n'est plus exporté ;
- le même mapper construit un champ `name` absent de `DeveloperProfile` ;
- `packages/core/src/tests/fixtures/profiles/perceval/code/invoice.ts` et `user-service.ts` importent un module `../db` inexistant.

La cause structurelle est double : un ancien mapper coexiste avec `developer-profile-mapper.ts`, et le `tsconfig` du package inclut tout `src` en n'excluant que les fichiers `*.spec.ts`. Il compile donc également le code fictif contenu dans les profils de test.

Impact : un agent qui exécute les scripts standards conclura que le package central n'est pas livrable, même si les tests et le build Next.js passent.

### P0-2 — Un clone public ne contient aucun profil exécutable

Le dossier `data/profiles/` est ignoré par Git et `git ls-files data` ne retourne aucun fichier. Le fichier `.env.local`, qui définit localement `PROFILES_BASE_DIR=../../data/profiles/profiles`, est lui aussi ignoré. En l'absence de variable d'environnement, le container utilise une chaîne vide (`packages/app-nextjs/src/di/container.ts:58`).

Conséquence sur un clone neuf : `/api/profiles` retourne vraisemblablement une liste vide, et l'application ne permet pas de reproduire la démonstration décrite dans le README. Les profils présents dans les fixtures de `core` ne sont pas utilisés comme fallback par l'application.

Impact : échec probable du critère « outil fonctionnel et reproductibilité » si le jury clone le dépôt sans disposer de données ou de variables externes.

### P0-3 — Aucun contrôle continu ne protège la branche principale

Aucun workflow CI n'est présent. Le dépôt permet donc de fusionner un état où les tests passent mais où le package `core` ne compile pas. L'écart actuel entre `npm test`, le build Next.js et le build du package illustre concrètement ce risque.

Impact : les badges implicites de qualité sont absents, et aucune preuve automatique n'établit qu'un commit donné passe installation, lint, tests et builds.

## Constats majeurs — P1

### P1-1 — Absence complète de tests frontend et API

`packages/app-nextjs` ne contient aucun test. Ne sont donc pas protégés :

- la validation et la migration de `EvaluationConfig` ;
- les réponses `400`, `422` et `500` de l'API ;
- la navigation des lignes de `/profiles` ;
- la persistance `localStorage` ;
- les états loading, error et empty ;
- les contraintes UI des thresholds ;
- la correspondance entre routes dynamiques et axes.

Le build vérifie les types et la compilation, mais pas le comportement. Un agent pondérant la pyramide de tests considérera la couverture annoncée comme limitée au package métier.

### P1-2 — Documentation en contradiction avec le code

Le code fixe désormais `parallelism.levels.gold.minScore` à `30`, mais :

- `README.md` annonce encore `gold = 20` ;
- `reference.md` annonce encore `gold = 20` ;
- `reference.md` indique que le reset remet « toutes les valeurs à zéro », alors qu'il restaure les valeurs par défaut ;
- la page `/demo` ajoutée localement n'est pas documentée et sa vidéo n'est pas livrée.

Impact : perte de confiance dans la documentation et risque qu'un agent considère les règles métier non maîtrisées.

### P1-3 — Risque de traversal et absence de confinement explicite des profils

`LaivelUpDeveloperProfileRepository.findById` compose directement `path.join(this.baseDir, profileId)` sans vérifier que le chemin résolu reste sous `baseDir` (`laivel-up-developer-profile-repository.ts:37-38`). La route transmet le paramètre d'URL au repository sans validation de format.

Selon le décodage effectué par Next.js et le système de fichiers cible, une valeur contenant des segments relatifs peut tenter de sortir du répertoire prévu. L'exploitabilité exacte dépend du runtime, mais l'absence d'invariant de confinement est certaine.

Impact : risque de lecture de fichiers `profile.json` hors du périmètre autorisé et signal négatif lors d'une analyse sécurité statique.

### P1-4 — Erreurs d'entrée transformées en erreurs serveur

`readRaw` utilise directement `readFileSync` et `JSON.parse` sans convertir les erreurs d'I/O ou de JSON en `ParseError`. Le `Result` du repository ne couvre donc que les erreurs retournées par le parser, pas les erreurs de chargement. Un profil absent ou un JSON invalide peut lever une exception et produire une réponse `500`.

À l'inverse, `findAll` absorbe silencieusement toutes les erreurs et retire le profil de la liste sans diagnostic (`laivel-up-developer-profile-repository.ts:23-33`). Les deux méthodes ont donc des politiques d'erreur opposées.

Impact : comportement difficile à diagnostiquer et gestion des erreurs non uniforme.

### P1-5 — Fichiers centraux trop volumineux

Les principaux hotspots mesurés sont :

- `developer-profile-result.presenter.ts` : 747 lignes ;
- `config-page.tsx` : 431 lignes ;
- `evaluation-page.tsx` : 361 lignes ;
- `developer-profile-mapper.ts` : 267 lignes ;
- `container.ts` : 251 lignes ;
- `profiles-page.tsx` : 250 lignes.

Le presenter concentre labels, formatting, construction de groupes, données manquantes et mapping final. La page Config concentre état, validation et rendu de tous les groupes. Le container combine registry globale, factories par défaut et composition dynamique par requête.

Impact : augmentation du coût de modification, conflits plus fréquents et difficulté à tester chaque responsabilité isolément.

### P1-6 — Intégration incomplète de `deliveryConfidence`

`deliveryConfidence` dispose d'un calculator, d'un readiness checker et d'un signal detector. En revanche :

- il ne possède pas d'`ImprovementOpportunityDetector` dédié ;
- `ImprovementOpportunityService` et sa composition dans `container.ts` ne l'intègrent pas ;
- le signal detector n'a que 25 % de couverture statements ;
- le use case et le calculator créent des implémentations concrètes et une config par défaut dans leurs paramètres par défaut, au lieu de dépendre exclusivement des ports injectés.

Impact : l'affirmation « ajouter un axe sans modifier la logique de composition » est trop forte. L'axe produit des signaux, mais n'offre pas le même flux de simulation de progression que les axes historiques.

### P1-7 — Validation de configuration permissive et partiellement silencieuse

`mergeNumericConfig` remplace silencieusement les valeurs non numériques, négatives ou non finies par les valeurs par défaut. `parseEvaluationConfig` valide l'ordre après cette normalisation. Ainsi, certaines entrées API invalides ne produisent pas de `400` mais sont acceptées avec substitution silencieuse.

Impact : le client peut croire que sa configuration a été appliquée alors qu'une partie a été ignorée. La frontière API manque d'un contrat strict distinct de la migration tolérante du `localStorage`.

## Constats modérés — P2

### P2-1 — Mesure de couverture trompeuse

La couverture globale inclut `src/tests/fixtures` et même des fichiers de code fictifs. Elle affiche 92,50 %, mais certains composants utiles sont faiblement ou pas couverts :

- `delivery-confidence-signal-detector.ts` : 25 % ;
- `weighted-average-size-signal-detector.ts` : 0 % ;
- `developer-profile-summary-mapper.ts` : 53,84 %.

Aucun seuil minimal de couverture n'est configuré. La valeur globale ne constitue donc pas une garantie durable.

### P2-2 — Artefact de compilation versionné

`packages/app-nextjs/tsconfig.tsbuildinfo` est suivi par Git, alors qu'il s'agit d'un cache incrémental dépendant de l'environnement. Il augmente le bruit dans les diffs et peut créer des conflits inutiles.

### P2-3 — Recherche récursive synchrone non bornée

Le repository cherche chaque fichier séparément par parcours récursif synchrone. Pour sept noms de fichiers, le même arbre peut être parcouru plusieurs fois. Aucun traitement des liens symboliques, aucune limite de profondeur et aucune règle en cas de doublons ne sont explicités : le premier fichier rencontré gagne selon l'ordre retourné par le système.

Impact : acceptable pour de petites fixtures, moins prévisible sur des profils volumineux ou contrôlés par un tiers.

### P2-4 — Configuration d'environnement peu explicite

Il n'existe pas de `.env.example` versionné ni de validation au démarrage de `PROFILES_BASE_DIR`. Une valeur absente devient `''`, ce qui reporte l'erreur jusqu'à l'utilisation du repository. Le README n'explique pas clairement cette variable.

### P2-5 — Docker sans rapport avec l'application principale

Le `docker-compose.yml` lance uniquement `json-server` sur `docker/db.json`. Il ne construit ni `@laivel-up/core` ni Next.js et n'apporte pas de chemin reproductible pour lancer l'outil soumis. Sa présence peut induire un évaluateur en erreur.

### P2-6 — Politique de dépendances et runtime non verrouillée dans les manifests

La documentation demande Node.js 20 et npm 10, mais aucun champ `engines` ne formalise ces versions dans `package.json`. Aucun contrôle automatique de compatibilité n'est exécuté.

### P2-7 — Vidéo locale incompatible avec une livraison Git standard

Le fichier local `video.mp4` fait environ 107 Mo et n'est pas suivi. Il dépasse la limite classique de fichier GitHub. La page `/demo` référence `/demo.mp4`, mais aucun tel asset n'est présent dans `packages/app-nextjs/public`.

Impact : la route compile, mais le lecteur retourne une ressource absente dans l'état actuel.

## Maintenabilité par domaine

| Domaine | Évaluation | Justification |
|---|---|---|
| Architecture | Bonne base | Couches explicites, ports et stratégies, mais composition centrale très couplée |
| Modèle métier | Bon | Types précis, règles déterministes, thresholds explicites |
| Robustesse des entrées | Moyenne | Zod et mode permissif utiles, erreurs I/O non uniformes |
| Tests métier | Très bon | 258 tests et nombreux cas limites |
| Tests d'intégration/UI | Faible | Aucun test Next.js/API/browser |
| Documentation | Moyenne à faible | Dense, mais plusieurs affirmations sont déjà obsolètes |
| Reproductibilité | Faible | Données et configuration nécessaires absentes du dépôt |
| Sécurité | Moyenne à faible | Pas de confinement explicite de `profileId`, API locale sans contrat strict |
| Exploitabilité | Moyenne | App Next.js buildable, package core autonome non buildable |

## Ordre de traitement recommandé

1. Rendre `npm run build --workspace=packages/core` exécutable en supprimant le mapper obsolète du chemin de compilation et en excluant correctement les codes de fixtures.
2. Fournir un jeu minimal de profils versionné et un `.env.example`, ou un fallback explicite vers des fixtures de démonstration.
3. Ajouter une CI exécutant installation verrouillée, lint, tests, couverture et builds des deux workspaces.
4. Sécuriser et uniformiser le repository : validation de `profileId`, confinement du chemin et conversion des erreurs d'I/O en erreurs applicatives.
5. Ajouter des tests de routes API et quelques tests frontend sur les flux critiques.
6. Synchroniser README et `reference.md` avec les defaults réels, notamment `parallelism.gold = 30`.
7. Découper le presenter, la page Config et le container en registries/factories spécialisés.
8. Achever l'intégration de `deliveryConfidence` dans les improvement opportunities et augmenter sa couverture ciblée.
9. Exclure les fixtures du rapport de couverture et imposer des seuils par catégorie.
10. Retirer les artefacts générés du suivi Git et documenter clairement le mode de déploiement.

## Conclusion

La logique métier est la partie la plus convaincante du projet : elle est déterministe, explicite et fortement testée. La faiblesse principale n'est pas l'algorithme, mais l'enveloppe de livraison. Un agent évaluant uniquement `npm test` donnera une impression favorable ; un agent exécutant une matrice plus complète identifiera immédiatement le build `core` cassé, l'absence de données dans un clone et l'absence de tests frontend.

Le risque le plus important pour la note est donc l'écart entre la qualité interne du domaine et la capacité d'un tiers à cloner, lancer, vérifier et comprendre le projet sans contexte local.

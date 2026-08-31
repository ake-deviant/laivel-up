# Méthodologie — Laivel Up

## Principe

Laivel Up est un **framework d'évaluation modulaire**, pas un verdict figé. L'outil pose un cadre : des axes, des algorithmes, des seuils. Chaque couche est remplaçable indépendamment des autres — depuis l'interface pour les réglages courants, dans le code pour les besoins spécifiques. Plusieurs équipes ou jurys peuvent faire tourner la même application avec des critères entièrement différents sans aucune modification partagée.

Le scoring lui-même est déterministe : l'outil lit ce que le dépôt expose — taille des PR, fichiers de contexte en place, commits humains, branches concurrentes — et applique des règles explicites. Aucun LLM n'intervient dans le calcul. Le verdict est reproductible à données égales.

---

## Les axes

Le référentiel AIDD définit quatre axes : Taille, Harness, Intervention, Parallélisme. L'outil les implémente tous les quatre et en ajoute deux en extension : Velocity (ratio levier sprint) et Delivery Confidence (fiabilité de livraison et impact business). Ces deux axes supplémentaires produisent des signaux et des pistes de progression mais ne bloquent pas le level global — la décision de les rendre bloquants est laissée à la configuration.

| Axe | Données sources | Ce que le calcul mesure |
| :--- | :--- | :--- |
| **Size** | distribution des PR par taille | Part dominante de L et XL sur l'ensemble des livraisons |
| **Harness** | repo-context (fichiers de config IA) + CI | Profondeur de l'outillage : context engineering → behavior → boucles |
| **Intervention** | commits par PR, éditions humaines, review comments | À quel point l'humain reprend le travail de l'IA après démarrage |
| **Parallelism** | branches concurrentes médiane et max | Usage habituel du travail en parallèle (pics isolés exclus) |
| **Velocity** | sprint metrics (levier, complétion, cycle time) | Gain de vélocité attribuable à l'IA |
| **Delivery Confidence** | engagement vs livraison, autonomie, impact | Autonomie réelle et fiabilité sur le terrain |

---

## La règle du plus bas

Le level global est le minimum de tous les axes bloquants. Cette règle suit directement le référentiel : *"un niveau n'est atteint que si tous ses axes le sont"*. Un développeur Gold sur cinq axes mais Copper sur le sixième est Copper. Ce n'est pas une pénalité : c'est la définition même du niveau. Un axe faible révèle une limite réelle dans la pratique, pas un oubli ponctuel.

---

## Comment le verdict est produit

Chaque axe calcule un level, puis détecte des **signaux** : valeurs observées, seuils franchis ou manqués. À partir de ces signaux, des **opportunités d'amélioration** sont dérivées axe par axe. Si un seul signal manque pour passer au level suivant, l'outil l'identifie et formule ce qui changerait.

Le résultat final expose donc trois couches :
1. Le level global et le level par axe
2. Les signaux qui ont produit ce verdict
3. Les actions concrètes pour progresser d'un niveau

---

## Gestion des données manquantes

Un profil peut être incomplet. Le parser tente une lecture stricte, puis bascule en mode permissif : les champs mal formés sont capturés comme avertissements sans bloquer l'évaluation. Les seuls champs bloquants sont l'identifiant et la liste des sources disponibles.

Quand une source est absente, l'axe qu'elle alimente est marqué comme non lisible. Ce n'est pas zéro : l'outil suspend le calcul de cet axe plutôt que de produire un verdict sans données. Un axe suspendu ne pénalise pas, mais il n'atteste pas non plus.

---

## Modularité

La modularité est le principe central du projet. Elle s'exprime à trois niveaux.

**Sans toucher au code — via l'interface.** Pour trois axes (Size, Harness, Parallelism), plusieurs algorithmes sont proposés. L'utilisateur choisit celui qui correspond à sa lecture du référentiel : l'algorithme sélectionné est envoyé à chaque évaluation et modifie le calcul, les signaux et les pistes d'amélioration de façon cohérente. Les poids et seuils sont également ajustables, avec restauration en un clic. Un axe peut être rendu non-bloquant sans toucher au code : il continue de produire des signaux sans peser sur le level global.

**Plusieurs utilisateurs, plusieurs critères.** La configuration est propre à chaque session. Deux jurys utilisant la même instance peuvent appliquer des algorithmes et des seuils différents. Rien n'est partagé entre leurs évaluations : chaque appel embarque sa configuration complète.

**Extensibilité pour l'équipe de développement.** L'architecture sépare strictement les axes, les calculateurs et les interfaces qui les exposent. Ajouter un axe revient à implémenter son calculateur, son détecteur de signaux et son détecteur d'opportunités d'amélioration — sans modifier les autres axes ni la logique de composition. Ajouter un algorithme sur un axe existant revient à brancher une nouvelle implémentation derrière l'interface existante. Retirer un algorithme ne casse aucun consommateur.

**Pas de LLM dans le scoring.** Un verdict reproductible exige des règles stables. Si deux évaluations du même profil peuvent diverger, le résultat ne peut pas servir de base de comparaison entre développeurs.

---

## Axe d'amélioration : analyse sémantique par LLM

L'axe Harness est aujourd'hui évalué structurellement : l'outil détecte la présence de fichiers (CLAUDE.md, hooks, rules, agents…) et accumule des points. Ce qu'il ne lit pas, c'est **le contenu** de ces fichiers.

Un CLAUDE.md peut exister sans rien dire d'utile. Des rules peuvent être vides ou contradictoires. Des plans peuvent être des squelettes jamais remplis. La présence d'un fichier ne dit pas si le contexte qu'il encode est réellement exploitable par un modèle.

L'amélioration naturelle serait d'appeler un LLM sur ces fichiers pour évaluer :
- la densité d'information utile dans CLAUDE.md (conventions réelles, architecture documentée, contraintes explicites)
- la cohérence des rules et leur capacité à guider le comportement du modèle
- la complétude des plans et specs (pas juste leur existence)
- la qualité des agents (leur prompt est-il précis et actionnable ?)

Ce signal qualitatif remplacerait ou viendrait pondérer le score structurel actuel. Il resterait à résoudre la question de la reproductibilité : deux appels LLM sur le même contenu peuvent produire des scores différents. Une solution serait de fixer le modèle, la température à zéro, et un prompt de scoring très contraint avec réponse structurée (JSON), pour minimiser la variance tout en gagnant en profondeur d'analyse.

---

→ [README](README.md) · [Référence technique](reference.md)

# Axe Harness — Décisions d'implémentation

## Référentiel

| Level | Harness requis | Ce qu'on observe |
|---|---|---|
| `white` | rien | Aucun fichier de contexte, aucun commit signé par un assistant |
| `red` | prompts | Pas de fichier de contexte structuré |
| `blue` | context engineering | Mémoire projet présente et maintenue |
| `green` | context engineering + behavior | Règles et agents versionnés dans le dépôt |
| `copper` | context engineering + behavior | Idem green — différencié par l'axe parallèle |
| `silver` | context engineering + behavior + boucles | Relance automatique de l'IA tant que les critères échouent |
| `gold` | context engineering + behavior + boucles | Idem silver — différencié par l'axe intervention |

**Conséquence** : sur l'axe harness seul, il n'existe que 4 paliers distincts :
- `white` / `red` — aucun contexte structuré
- `blue` — context engineering présent
- `green` / `copper` — context engineering + behavior (le parallèle distingue les deux)
- `silver` / `gold` — context engineering + behavior + boucles (l'intervention distingue les deux)

## Prérequis par level

Les prérequis sont des **conditions bloquantes**, pas des seuils de score.

| Level | Prérequis |
|---|---|
| `blue` | au moins un signal context engineering présent |
| `green` | prérequis blue + au moins un signal behavior présent |
| `copper` | idem green |
| `silver` | prérequis green + `ci_passes_first_try` = true |
| `gold` | idem silver |

## Conditions par level

### Blue

Minimum pour atteindre Blue : au moins l'un des signaux context engineering suivants est présent.

- `claude_md` — `CLAUDE.md`
- `docs_context` — `docs/context/`
- `docs_specs` — `docs/specs/`
- `docs_brainstorm` — `docs/brainstorm/`
- `docs_plans` — `docs/plans/`
- `aidd_memory` — `aidd_docs/memory/`
- `aidd_tasks` — `aidd_docs/tasks/`

## Signaux et pondération

Score calculé sur le contenu détecté dans le dossier du profil.
Pour les dossiers : 1 fichier trouvé = poids de base (voir colonne Poids/fichier).

| Clé | Ce qu'on détecte | Type | Poids / fichier |
|---|---|---|---|
| `claude_md` | `CLAUDE.md` | Fichier | 4 |
| `claude_settings` | `.claude/settings.json` | Fichier | 2 |
| | | | |
| `docs_context` | `docs/context/` | Dossier avec contenu | 2 |
| `docs_specs` | `docs/specs/` | Dossier avec contenu | 3 |
| `docs_brainstorm` | `docs/brainstorm/` | Dossier avec contenu | 2 |
| `docs_plans` | `docs/plans/` | Dossier avec contenu | 3 |
| `aidd_memory` | `aidd_docs/memory/` | Dossier avec contenu | 4 |
| `aidd_tasks` | `aidd_docs/tasks/` | Dossier avec contenu | 3 |
| | | | |
| `agents_md` | `AGENTS.md` | Fichier | 3 |
| `claude_agents` | `.claude/agents/` | Dossier avec contenu | 3 |
| `claude_skills` | `.claude/skills/` | Dossier avec contenu | 3 |
| `claude_hooks` | `.claude/hooks/` | Dossier avec contenu | 4 |
| `claude_rules` | `.claude/rules/` | Dossier avec contenu | 4 |
| | | | |
| `ci_passes_first_try` | `ciMedianRunsToGreen ≤ 1` | Métrique | 6 |

Score max total : **46**

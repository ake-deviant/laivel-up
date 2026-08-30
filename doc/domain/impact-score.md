# Impact score des champs

Référentiel exhaustif des champs décrits dans `doc/infra/schemas`.

Ce document couvre les champs actuellement implémentés et ceux qui restent à intégrer. Lorsqu'une
donnée est absente après validation des champs bloquants :

- `Impact score = Oui` : la donnée appartient à `impactingNulls` ;
- `Impact score = Non` : la donnée appartient à `ignoredNulls`.

`profile_id` et `available` sont des champs d'entrée obligatoires. Leur absence reste une erreur de
parsing et ne doit pas être classée comme un null non bloquant.

## `profile.json`

| Champ | Impact score |
|---|---|
| `profile_id` | Non |
| `available` | Non |
| `role` | Non |
| `experience_years` | Non |
| `stack` | Non |
| `team_size` | Non |
| `note` | Non |

## `git-activity.json`

| Champ | Impact score |
|---|---|
| `period.from` | Non |
| `period.to` | Non |
| `repositories` | Non |
| `pull_requests.total` | Non |
| `pull_requests.size_distribution.xs` | Oui |
| `pull_requests.size_distribution.s` | Oui |
| `pull_requests.size_distribution.m` | Oui |
| `pull_requests.size_distribution.l` | Oui |
| `pull_requests.size_distribution.xl` | Oui |
| `pull_requests.median_files_changed` | Oui |
| `pull_requests.median_lines_changed` | Oui |
| `pull_requests.median_correction_commits_after_open` | Oui |
| `pull_requests.merged_without_human_edit_after_open` | Oui |
| `pull_requests.reverted` | Non |
| `pull_requests.median_review_comments_received` | Oui |
| `commits.total` | Non |
| `commits.median_per_pr` | Non |
| `commits.ai_coauthored_ratio` | Oui |
| `commits.message_convention_compliance` | Non |
| `tests.coverage_start` | Non |
| `tests.coverage_end` | Non |
| `tests.prs_with_tests_ratio` | Non |
| `parallelism.max_concurrent_branches` | Oui |
| `parallelism.median_concurrent_branches` | Oui |
| `ci.failure_rate` | Non |
| `ci.median_runs_to_green` | Oui |
| `context_files.agents_md` | Oui |
| `context_files.rules_count` | Oui |
| `context_files.skills_count` | Oui |
| `context_files.hooks_count` | Oui |
| `context_files.agents_count` | Oui |
| `context_files.last_updated` | Non |
| `assistant_usage.declared_tools` | Non |
| `assistant_usage.editor_integration` | Non |
| `assistant_usage.sessions_per_week` | Non |
| `assistant_usage.tokens_per_week` | Non |

## `pull-requests.json`

| Champ | Impact score |
|---|---|
| `[].number` | Non |
| `[].title` | Non |
| `[].state` | Non |
| `[].draft` | Non |
| `[].merged` | Non |
| `[].created_at` | Oui |
| `[].merged_at` | Oui |
| `[].closed_at` | Non |
| `[].head.ref` | Non |
| `[].base.ref` | Non |
| `[].changed_files` | Oui |
| `[].additions` | Oui |
| `[].deletions` | Oui |
| `[].commits` | Oui |
| `[].review_comments` | Oui |
| `[].body` | Oui |

## `sonar-measures.json`

| Champ | Impact score |
|---|---|
| `component.key` | Non |
| `component.name` | Non |
| `component.qualifier` | Non |
| `component.language` | Non |
| `measures[ncloc].value` | Non |
| `measures[files].value` | Non |
| `measures[duplicated_lines_density].value` | Non |
| `measures[complexity].value` | Non |
| `measures[cognitive_complexity].value` | Non |
| `measures[coverage].value` | Oui |
| `measures[branch_coverage].value` | Oui |
| `measures[tests].value` | Non |
| `measures[uncovered_files].value` | Non |
| `measures[code_smells].value` | Oui |
| `measures[bugs].value` | Oui |
| `measures[sqale_index].value` | Non |
| `analysedAt` | Non |

## `declaratif.md`

| Champ | Impact score |
|---|---|
| Contenu brut | Oui |

## `session.md`

| Champ | Impact score |
|---|---|
| Contenu brut | Oui |

## `repo-context/`

### Présence des fichiers et dossiers

| Champ | Impact score |
|---|---|
| `CLAUDE.md` | Oui |
| `AGENTS.md` | Oui |
| `.worktreeinclude` | Oui |
| `.claude/settings.json` | Oui |
| `.claude/skills/` | Oui |
| `.claude/agents/` | Oui |
| `.claude/hooks/` | Oui |
| `.claude/rules/` | Oui |
| `docs/context/` | Oui |
| `docs/specs/` | Oui |
| `docs/brainstorm/` | Oui |
| `docs/plans/` | Oui |
| `aidd_docs/memory/` | Oui |
| `aidd_docs/tasks/` | Oui |

### `.claude/settings.json`

| Champ | Impact score |
|---|---|
| `enabledPlugins` | Oui |
| `permissions.deny` | Oui |
| `hooks` | Oui |
| `extraKnownMarketplaces` | Non |

## `code/`

| Champ | Impact score |
|---|---|
| Contenu brut des fichiers | Oui |

## Synthèse

| Catégorie | Nombre |
|---|---:|
| Champs répertoriés | 97 |
| Impact score : Oui | 51 |
| Impact score : Non | 46 |

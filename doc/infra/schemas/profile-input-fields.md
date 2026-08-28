# Champs disponibles par source — profil développeur

## `profile.json`

| Champ | Type | Arthur |
|---|---|---|
| `profile_id` | `string` | `"arthur"` |
| `role` | `string` | `"développeur indépendant"` |
| `experience_years` | `number` | `9` |
| `stack` | `string[]` | `["Python", "FastAPI", "TypeScript", "React", "Terraform"]` |
| `team_size` | `number` | `1` |
| `available` | `string[]` | `["git-activity.json", "code/", "sonar-measures.json", "repo-context/", "session.md"]` |
| `note` | `string \| null` | `"La personne n'a pas répondu au questionnaire déclaratif."` |

---

## `git-activity.json`

| Champ | Type | Arthur |
|---|---|---|
| `period.from` | `string` (date ISO) | `"2026-01-15"` |
| `period.to` | `string` (date ISO) | `"2026-07-15"` |
| `repositories` | `number` | `6` |
| `pull_requests.total` | `number` | `154` |
| `pull_requests.size_distribution.xs` | `number` | `3` |
| `pull_requests.size_distribution.s` | `number` | `9` |
| `pull_requests.size_distribution.m` | `number` | `29` |
| `pull_requests.size_distribution.l` | `number` | `65` |
| `pull_requests.size_distribution.xl` | `number` | `48` |
| `pull_requests.median_files_changed` | `number` | `29` |
| `pull_requests.median_lines_changed` | `number` | `1050` |
| `pull_requests.median_correction_commits_after_open` | `number` | `1` |
| `pull_requests.merged_without_human_edit_after_open` | `number` | `46` |
| `pull_requests.reverted` | `number` | `3` |
| `pull_requests.median_review_comments_received` | `number` | `1` |
| `commits.total` | `number` | `1195` |
| `commits.median_per_pr` | `number` | `7` |
| `commits.ai_coauthored_ratio` | `number` (0–1) | `0.91` |
| `commits.message_convention_compliance` | `number` (0–1) | `0.82` |
| `tests.coverage_start` | `number` (0–1) | `0.58` |
| `tests.coverage_end` | `number` (0–1) | `0.79` |
| `tests.prs_with_tests_ratio` | `number` (0–1) | `0.88` |
| `parallelism.max_concurrent_branches` | `number` | `7` |
| `parallelism.median_concurrent_branches` | `number` | `4` |
| `ci.failure_rate` | `number` (0–1) | `0.07` |
| `ci.median_runs_to_green` | `number` | `2` |
| `context_files.agents_md` | `boolean` | `true` |
| `context_files.rules_count` | `number` | `0` |
| `context_files.skills_count` | `number` | `4` |
| `context_files.hooks_count` | `number` | `0` |
| `context_files.agents_count` | `number` | `2` |
| `context_files.last_updated` | `string \| null` (date ISO) | `"2026-07-14"` |
| `assistant_usage.declared_tools` | `string[]` | `["claude-code", "codex"]` |
| `assistant_usage.editor_integration` | `boolean` | `true` |
| `assistant_usage.sessions_per_week` | `number` | `74` |
| `assistant_usage.tokens_per_week` | `number` | `21000000` |

---

## `sonar-measures.json`

| Champ | Type | Arthur |
|---|---|---|
| `component.key` | `string` | `"solo:portal"` |
| `component.name` | `string` | `"portal"` |
| `component.language` | `string` | `"ts"` |
| `measures[ncloc].value` | `string` | `"70224"` |
| `measures[files].value` | `string` | `"418"` |
| `measures[duplicated_lines_density].value` | `string` | `"2.4"` |
| `measures[complexity].value` | `string` | `"1760"` |
| `measures[cognitive_complexity].value` | `string` | `"1660"` |
| `measures[coverage].value` | `string` | `"85.0"` |
| `measures[branch_coverage].value` | `string` | `"76.0"` |
| `measures[tests].value` | `string` | `"3316"` |
| `measures[uncovered_files].value` | `string` | `"53"` |
| `measures[code_smells].value` | `string` | `"10"` |
| `measures[bugs].value` | `string` | `"0"` |
| `measures[sqale_index].value` | `string` | `"228"` |
| `analysedAt` | `string` (date ISO) | `"2026-07-13T19:52:41+0000"` |

---

## `repo-context/`

| Champ | Type | Source | Arthur |
|---|---|---|---|
| `settings.json > enabledPlugins` | `Record<string, boolean>` | `profile/arthur/repo-context/.claude/settings.json` | `{ "superpowers@claude-plugins-official": true }` |
| `settings.json > permissions.deny` | `string[]` | `profile/arthur/repo-context/.claude/settings.json` | `["Bash(terraform apply:*)", "Bash(aws iam:*)", "Read(./secrets/**)", "Read(./**/.env*)"]` |
| Présence de `.claude/skills/*` | `boolean` / `string[]` (noms) | `profile/arthur/repo-context/.claude/skills/` | `["check-task", "harden", "migrate-external-api", "plan"]` |
| Présence de `.claude/agents/*` | `boolean` / `string[]` (noms) | `profile/arthur/repo-context/.claude/agents/` | `["migration-auditor", "spec-reviewer"]` |
| Présence de `.worktreeinclude` | `boolean` | `profile/arthur/repo-context/.worktreeinclude` | `true` |
| Présence de `CLAUDE.md` | `boolean` | `profile/arthur/repo-context/CLAUDE.md` | `true` |
| Présence de `AGENTS.md` | `boolean` | `profile/arthur/repo-context/AGENTS.md` | `true` |
| Présence de `docs/context/` | `boolean` | `profile/arthur/repo-context/docs/context/` | `true` |

---

## `session.md`

| Champ | Type | Arthur |
|---|---|---|
| Contenu brut | `string` (texte libre, non structuré) | *(présent)* |

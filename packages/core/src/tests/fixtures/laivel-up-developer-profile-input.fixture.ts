import * as fs from 'fs';
import * as path from 'path';
import { LaivelUpAiContextInput } from '../../infrastructure/inputs/laivel-up-ai-context-input';
import { LaivelUpProfileInput } from '../../infrastructure/inputs/laivel-up-profile-input';

const PROFILES_DIR = path.resolve(process.cwd(), process.env.PROFILES_BASE_DIR!);

function findFile(dir: string, filename: string): string | null {
  if (!fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isFile() && entry.name === filename) return full;
    if (entry.isDirectory()) {
      const found = findFile(full, filename);
      if (found) return found;
    }
  }
  return null;
}

function countEntries(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).length;
}

function resolveAiContext(profileDir: string): LaivelUpAiContextInput | null {
  const contextDir = path.join(profileDir, 'repo-context');
  if (!fs.existsSync(contextDir)) return null;

  const has = (p: string) => fs.existsSync(path.join(contextDir, p));
  const hasSettings = has('.claude/settings.json');

  return {
    hasClaude: has('CLAUDE.md'),
    hasAgentsMd: has('AGENTS.md'),
    hasWorktreeInclude: has('.worktreeinclude'),
    hasDocsContext: has('docs/context'),
    hasDocsSpecs: has('docs/specs'),
    hasDocsBrainstorm: has('docs/brainstorm'),
    hasDocsPlans: has('docs/plans'),
    hasMemory: has('aidd_docs/memory'),
    hasTasks: has('aidd_docs/tasks'),
    settings: hasSettings
      ? {
          hasSettings: true,
          hasHooks: has('.claude/hooks'),
          rulesCount: countEntries(path.join(contextDir, '.claude/rules')),
          skillsCount: countEntries(path.join(contextDir, '.claude/skills')),
          agentsCount: countEntries(path.join(contextDir, '.claude/agents')),
        }
      : null,
  };
}

function load(name: string): LaivelUpProfileInput {
  const profileDir = path.join(PROFILES_DIR, name);
  const profileJson = JSON.parse(fs.readFileSync(path.join(profileDir, 'profile.json'), 'utf-8'));

  const gitActivityPath = findFile(profileDir, 'git-activity.json');
  const pullRequestsPath = findFile(profileDir, 'pull-requests.json');
  const sonarPath = findFile(profileDir, 'sonar-measures.json');
  const sprintMetricsPath = findFile(profileDir, 'sprint-metrics.json');
  const declaratifPath = findFile(profileDir, 'declaratif.md');
  const sessionPath = findFile(profileDir, 'session.md');

  return {
    profile_id: profileJson.profile_id,
    available: profileJson.available,
    role: profileJson.role ?? null,
    experience_years: profileJson.experience_years ?? null,
    stack: profileJson.stack ?? null,
    team_size: profileJson.team_size ?? null,
    note: profileJson.note ?? null,
    gitActivity: gitActivityPath ? JSON.parse(fs.readFileSync(gitActivityPath, 'utf-8')) : null,
    pullRequests: pullRequestsPath ? JSON.parse(fs.readFileSync(pullRequestsPath, 'utf-8')) : null,
    sonarMeasures: sonarPath ? JSON.parse(fs.readFileSync(sonarPath, 'utf-8')) : null,
    sprintMetrics: sprintMetricsPath
      ? JSON.parse(fs.readFileSync(sprintMetricsPath, 'utf-8'))
      : null,
    aiContext: resolveAiContext(profileDir),
    declaratif: declaratifPath ? fs.readFileSync(declaratifPath, 'utf-8') : null,
    session: sessionPath ? fs.readFileSync(sessionPath, 'utf-8') : null,
  };
}

export class LaivelUpDeveloperProfileInputFixture {
  static arthur(): LaivelUpProfileInput {
    return load('arthur');
  }

  static bohort(): LaivelUpProfileInput {
    return load('bohort');
  }

  static leodagan(): LaivelUpProfileInput {
    return load('leodagan');
  }

  static perceval(): LaivelUpProfileInput {
    return load('perceval');
  }

  static paul(): LaivelUpProfileInput {
    return load('paul');
  }

  static gauvain(): LaivelUpProfileInput {
    return load('gauvain');
  }

  static lancelot(): LaivelUpProfileInput {
    return load('lancelot');
  }
}

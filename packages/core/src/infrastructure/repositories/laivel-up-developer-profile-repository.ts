import * as fs from 'fs';
import * as path from 'path';
import { IDeveloperProfileRepository } from '../../application/ports/developer-profile-repository.port';
import { IProfileParser } from '../../application/ports/profile-parser.port';
import { DeveloperProfileRepositoryResult } from '../../application/ports/developer-profile-repository.port';
import { ParseError } from '../../domain/errors/parse.error';
import { Result, ok } from '../../domain/shared/result';

export class LaivelUpDeveloperProfileRepository implements IDeveloperProfileRepository {
  constructor(
    private readonly parser: IProfileParser,
    private readonly baseDir: string,
  ) {}

  findById(profileId: string): Result<DeveloperProfileRepositoryResult, ParseError> {
    const raw = this.readRaw(path.join(this.baseDir, profileId));
    const result = this.parser.parse(raw);
    if (result.isErr) return result;
    return ok(result.value);
  }

  private readRaw(dirPath: string): unknown {
    const profileJson = JSON.parse(fs.readFileSync(path.join(dirPath, 'profile.json'), 'utf-8'));

    const gitActivityPath = this.findFile(dirPath, 'git-activity.json');
    const pullRequestsPath = this.findFile(dirPath, 'pull-requests.json');
    const sonarPath = this.findFile(dirPath, 'sonar-measures.json');
    const declaratifPath = this.findFile(dirPath, 'declaratif.md');
    const sessionPath = this.findFile(dirPath, 'session.md');

    return {
      ...profileJson,
      gitActivity: gitActivityPath ? JSON.parse(fs.readFileSync(gitActivityPath, 'utf-8')) : null,
      pullRequests: pullRequestsPath
        ? JSON.parse(fs.readFileSync(pullRequestsPath, 'utf-8'))
        : null,
      sonarMeasures: sonarPath ? JSON.parse(fs.readFileSync(sonarPath, 'utf-8')) : null,
      aiContext: this.resolveAiContext(path.join(dirPath, 'repo-context')),
      declaratif: declaratifPath ? fs.readFileSync(declaratifPath, 'utf-8') : null,
      session: sessionPath ? fs.readFileSync(sessionPath, 'utf-8') : null,
    };
  }

  private findFile(dir: string, filename: string): string | null {
    if (!fs.existsSync(dir)) return null;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === filename) return full;
      if (entry.isDirectory()) {
        const found = this.findFile(full, filename);
        if (found) return found;
      }
    }
    return null;
  }

  private resolveAiContext(contextDir: string): unknown {
    if (!fs.existsSync(contextDir)) return null;

    const has = (relativePath: string) => fs.existsSync(path.join(contextDir, relativePath));
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
            rulesCount: this.countEntries(path.join(contextDir, '.claude/rules')),
            skillsCount: this.countEntries(path.join(contextDir, '.claude/skills')),
            agentsCount: this.countEntries(path.join(contextDir, '.claude/agents')),
          }
        : null,
    };
  }

  private countEntries(dir: string): number {
    if (!fs.existsSync(dir)) return 0;
    return fs.readdirSync(dir).length;
  }
}

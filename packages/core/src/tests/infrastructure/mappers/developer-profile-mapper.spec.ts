import { DataSource } from '../../../domain/entities/data-source';
import { DeveloperProfileMapper } from '../../../infrastructure/mappers/developer-profile-mapper';
import { LaivelUpDeveloperProfileInputFixture } from '../../fixtures/laivel-up-developer-profile-input.fixture';

describe('DeveloperProfileMapper', () => {
  describe('arthur — profil sans pull-requests', () => {
    const input = LaivelUpDeveloperProfileInputFixture.arthur();
    const profile = DeveloperProfileMapper.toDomain(input);

    it('should map profile_id to id', () => {
      expect(profile.id).toBe('arthur');
    });

    it('should map available sources', () => {
      expect(profile.availableSources).toContain(DataSource.gitActivity);
      expect(profile.availableSources).toContain(DataSource.repoContext);
      expect(profile.availableSources).toContain(DataSource.session);
      expect(profile.availableSources).not.toContain(DataSource.pullRequests);
      expect(profile.availableSources).not.toContain(DataSource.declarative);
    });

    it('should map profile metadata', () => {
      expect(profile.profile?.role).toBe('développeur indépendant');
      expect(profile.profile?.experienceYears).toBe(9);
      expect(profile.profile?.teamSize).toBe(1);
    });

    it('should map size distribution from gitActivity', () => {
      expect(profile.size.distribution?.xs).toBeCloseTo(3 / 154);
      expect(profile.size.distribution?.s).toBeCloseTo(9 / 154);
      expect(profile.size.distribution?.m).toBeCloseTo(29 / 154);
      expect(profile.size.distribution?.l).toBeCloseTo(65 / 154);
      expect(profile.size.distribution?.xl).toBeCloseTo(48 / 154);
    });

    it('should map size medians from gitActivity', () => {
      expect(profile.size.medianFilesChanged).toBe(29);
      expect(profile.size.medianLinesChanged).toBe(1050);
    });

    it('should map contextEngineering from aiContext', () => {
      expect(profile.harness.contextEngineering?.claudeMd).toBe(1);
      expect(profile.harness.contextEngineering?.docsContextCount).toBe(1);
      expect(profile.harness.contextEngineering?.memoryCount).toBe(0);
    });

    it('should map aiConfiguration from gitActivity and aiContext', () => {
      expect(profile.harness.aiConfiguration?.agentsMd).toBe(1);
      expect(profile.harness.aiConfiguration?.skillsCount).toBe(4);
      expect(profile.harness.aiConfiguration?.agentsCount).toBe(2);
      expect(profile.harness.aiConfiguration?.rulesCount).toBe(0);
      expect(profile.harness.aiConfiguration?.hooksCount).toBe(0);
      expect(profile.harness.aiConfiguration?.settingsJson).toBe(1);
      expect(profile.harness.aiConfiguration?.aiCoauthoredRatio).toBe(0.91);
    });

    it('should map loops from gitActivity ci', () => {
      expect(profile.harness.loops?.ciMedianRunsToGreen).toBe(2);
    });

    it('should map intervention from gitActivity pull_requests', () => {
      expect(profile.intervention.medianCorrectionCommitsAfterOpen).toBe(1);
      expect(profile.intervention.medianReviewCommentsReceived).toBe(1);
      expect(profile.intervention.humanCommitRatio).toBeCloseTo(0.09);
    });

    it('should map parallelism from gitActivity', () => {
      expect(profile.parallelism.maxConcurrentBranches).toBe(7);
      expect(profile.parallelism.medianConcurrentBranches).toBe(4);
      expect(profile.parallelism.hasWorktreeInclude).toBe(true);
    });
  });

  describe('perceval — profil sans ai-context', () => {
    const input = LaivelUpDeveloperProfileInputFixture.perceval();
    const profile = DeveloperProfileMapper.toDomain(input);

    it('should set contextEngineering to null when aiContext is absent', () => {
      expect(profile.harness.contextEngineering).toBeNull();
    });

    it('should set aiConfiguration settingsJson to null when aiContext is absent', () => {
      expect(profile.harness.aiConfiguration?.settingsJson).toBeNull();
    });

    it('should fall back to gitActivity for AGENTS.md presence when aiContext is absent', () => {
      expect(profile.harness.aiConfiguration?.agentsMd).toBe(0);
    });

    it('should set hasWorktreeInclude to null when aiContext is absent', () => {
      expect(profile.parallelism.hasWorktreeInclude).toBeNull();
    });
  });

  it('should set size distribution to null when total pull requests is zero', () => {
    const input = LaivelUpDeveloperProfileInputFixture.arthur();
    if (!input.gitActivity?.pull_requests) throw new Error('Missing pull requests fixture');
    input.gitActivity.pull_requests.total = 0;

    const profile = DeveloperProfileMapper.toDomain(input);

    expect(profile.size.distribution).toBeNull();
  });

  it('should map AGENTS.md presence from gitActivity when repo context is unavailable', () => {
    const input = LaivelUpDeveloperProfileInputFixture.perceval();
    if (!input.gitActivity?.context_files) throw new Error('Missing context files fixture');
    input.gitActivity.context_files.agents_md = true;

    const profile = DeveloperProfileMapper.toDomain(input);

    expect(profile.harness.aiConfiguration?.agentsMd).toBe(1);
  });

  it('should prioritize observed repo context over gitActivity for AGENTS.md presence', () => {
    const input = LaivelUpDeveloperProfileInputFixture.arthur();
    if (!input.aiContext) throw new Error('Missing AI context fixture');
    if (!input.gitActivity?.context_files) throw new Error('Missing context files fixture');
    input.aiContext.hasAgentsMd = false;
    input.gitActivity.context_files.agents_md = true;

    const profile = DeveloperProfileMapper.toDomain(input);

    expect(profile.harness.aiConfiguration?.agentsMd).toBe(0);
  });

  it('should preserve missing axis data for paul', () => {
    const profile = DeveloperProfileMapper.toDomain(LaivelUpDeveloperProfileInputFixture.paul());

    expect(profile.id).toBe('paul');
    expect(profile.availableSources).toEqual([]);
    expect(profile.size.distribution).toBeNull();
    expect(profile.harness.contextEngineering).toBeNull();
    expect(profile.harness.aiConfiguration).toBeNull();
    expect(profile.harness.loops).toBeNull();
    expect(Object.values(profile.intervention).every((value) => value === null)).toBe(true);
    expect(Object.values(profile.parallelism).every((value) => value === null)).toBe(true);
  });
});

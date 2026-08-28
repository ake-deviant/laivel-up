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
      expect(profile.size.distribution?.xs).toBe(3);
      expect(profile.size.distribution?.s).toBe(9);
      expect(profile.size.distribution?.m).toBe(29);
      expect(profile.size.distribution?.l).toBe(65);
      expect(profile.size.distribution?.xl).toBe(48);
    });

    it('should map size medians from gitActivity', () => {
      expect(profile.size.medianFilesChanged).toBe(29);
      expect(profile.size.medianLinesChanged).toBe(1050);
    });

    it('should map contextEngineering from aiContext', () => {
      expect(profile.harness.contextEngineering?.hasClaude).toBe(true);
      expect(profile.harness.contextEngineering?.hasAgentsMd).toBe(true);
      expect(profile.harness.contextEngineering?.hasDocsContext).toBe(true);
      expect(profile.harness.contextEngineering?.hasMemory).toBe(false);
    });

    it('should map behavior from gitActivity context_files', () => {
      expect(profile.harness.behavior?.skillsCount).toBe(4);
      expect(profile.harness.behavior?.agentsCount).toBe(2);
      expect(profile.harness.behavior?.rulesCount).toBe(0);
      expect(profile.harness.behavior?.hooksCount).toBe(0);
      expect(profile.harness.behavior?.hasSettings).toBe(true);
      expect(profile.harness.behavior?.aiCoauthoredRatio).toBe(0.91);
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

    it('should set hasSettings to null when aiContext is absent', () => {
      expect(profile.harness.behavior?.hasSettings).toBeNull();
    });

    it('should set hasWorktreeInclude to null when aiContext is absent', () => {
      expect(profile.parallelism.hasWorktreeInclude).toBeNull();
    });
  });
});

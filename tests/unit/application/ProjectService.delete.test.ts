import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectService } from '../../../src/application/services/ProjectService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryProjectRepository } from '../../../src/infrastructure/persistence/InMemoryProjectRepository';
import { Project } from '../../../src/domain/models';

describe('ProjectService.deleteProject (物理削除)', () => {
  let service: ProjectService;

  beforeEach(async () => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerProjectRepository(new InMemoryProjectRepository());
    service = new ProjectService();

    const repo = RepositoryRegistry.getProjectRepository();
    await repo.save(new Project('PJ002', '新規製品開発プロジェクト'));
  });

  it('案件の紐づいていないプロジェクトが正常に削除（物理削除）できること', async () => {
    await service.deleteProject('PJ002');

    const projects = await service.getProjects();
    expect(projects).toHaveLength(1);
    expect(projects[0].id).toBe('PJ001');
  });

  it('案件が紐づいているシードプロジェクト (PJ001) の削除を試みた場合、ブロックされエラーになること', async () => {
    await expect(service.deleteProject('PJ001'))
      .rejects.toThrow('このプロジェクトには案件が登録されているため削除できません。');

    const projects = await service.getProjects();
    expect(projects).toHaveLength(2);
  });

  it('存在しないプロジェクトIDを指定して削除しようとした場合、エラーになること', async () => {
    await expect(service.deleteProject('PJ999'))
      .rejects.toThrow('指定されたプロジェクト（PJ999）が見つかりません。');
  });
});

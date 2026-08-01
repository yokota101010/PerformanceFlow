import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectService } from '../../../src/application/services/ProjectService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryProjectRepository } from '../../../src/infrastructure/persistence/InMemoryProjectRepository';
import { Project } from '../../../src/domain/models';

describe('ProjectService.getProjects (一覧取得)', () => {
  let service: ProjectService;

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerProjectRepository(new InMemoryProjectRepository());
    service = new ProjectService();
  });

  it('初期状態ではデータ無しの状態（0件）であること', async () => {
    const projects = await service.getProjects();
    expect(projects).toHaveLength(0);
  });

  it('複数登録されている場合、プロジェクトID of 昇順で取得できること', async () => {
    const repo = RepositoryRegistry.getProjectRepository();
    
    await repo.save(new Project('PJ001', '基幹基盤システム刷新プロジェクト'));
    await repo.save(new Project('PJ003', 'プロジェクトC'));
    await repo.save(new Project('PJ002', 'プロジェクトB'));

    const projects = await service.getProjects();

    expect(projects).toHaveLength(3);
    expect(projects[0].id).toBe('PJ001');
    expect(projects[1].id).toBe('PJ002');
    expect(projects[2].id).toBe('PJ003');
  });
});

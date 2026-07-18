import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectService } from '../../../src/application/services/ProjectService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { Project } from '../../../src/domain/models';

describe('ProjectService.getProjects (一覧取得)', () => {
  let service: ProjectService;

  beforeEach(() => {
    RepositoryRegistry.clear();
    service = new ProjectService();
  });

  it('初回起動時にシードデータ (PJ001) が自動的に投入されて取得できること', async () => {
    const projects = await service.getProjects();
    
    expect(projects).toHaveLength(1);
    expect(projects[0]).toEqual({
      id: 'PJ001',
      name: '次世代基幹システム開発プロジェクト'
    });
  });

  it('複数登録されている場合、プロジェクトIDの昇順で取得できること', async () => {
    // 既存リポジトリのインスタンスを取得して直接データを準備
    const repo = RepositoryRegistry.getProjectRepository();
    
    // シードに加えて PJ003 と PJ002 を登録（順序をバラバラにする）
    await repo.save(new Project('PJ003', 'プロジェクトC'));
    await repo.save(new Project('PJ002', 'プロジェクトB'));

    const projects = await service.getProjects();

    expect(projects).toHaveLength(3);
    expect(projects[0].id).toBe('PJ001');
    expect(projects[1].id).toBe('PJ002');
    expect(projects[2].id).toBe('PJ003');
  });
});

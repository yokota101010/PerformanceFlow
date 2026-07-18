import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectService } from '../../../src/application/services/ProjectService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { Project } from '../../../src/domain/models';

describe('ProjectService.createProject (新規登録)', () => {
  let service: ProjectService;

  beforeEach(() => {
    RepositoryRegistry.clear();
    service = new ProjectService();
  });

  it('正常な名称でプロジェクトを登録でき、IDが自動採番（最大値+1）されること', async () => {
    const newProject = await service.createProject({ name: '新規製品開発プロジェクト' });

    expect(newProject.id).toBe('PJ002'); // 初期シードPJ001の最大値1に+1
    expect(newProject.name).toBe('新規製品開発プロジェクト');

    // リポジトリに保存されていることを確認
    const projects = await service.getProjects();
    expect(projects).toHaveLength(2);
    expect(projects[1].id).toBe('PJ002');
  });

  it('入力されたプロジェクト名の前後の空白が自動でトリミングされること', async () => {
    const newProject = await service.createProject({ name: '   トリミングテストプロジェクト   ' });

    expect(newProject.name).toBe('トリミングテストプロジェクト');

    const repo = RepositoryRegistry.getProjectRepository();
    const saved = await repo.findById(newProject.id);
    expect(saved?.name).toBe('トリミングテストプロジェクト');
  });

  it('プロジェクト名が空欄またはスペースのみの場合は登録が拒否されエラーになること', async () => {
    // 空欄
    await expect(service.createProject({ name: '' }))
      .rejects.toThrow('プロジェクト名は必須です。');

    // スペースのみ
    await expect(service.createProject({ name: '    ' }))
      .rejects.toThrow('プロジェクト名は必須です。');
  });

  it('プロジェクト名が既に登録されている名称と重複している場合はエラーになること', async () => {
    // すでにシードとして「次世代基幹システム開発プロジェクト」が存在する
    await expect(service.createProject({ name: '次世代基幹システム開発プロジェクト' }))
      .rejects.toThrow('プロジェクト名「次世代基幹システム開発プロジェクト」は既に登録されています。');
  });

  it('プロジェクト名が255文字を超える場合は登録が拒否されること', async () => {
    const longName = 'a'.repeat(256);
    await expect(service.createProject({ name: longName }))
      .rejects.toThrow('プロジェクト名は255文字以内で入力してください。');
  });
});

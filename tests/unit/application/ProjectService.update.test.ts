import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectService } from '../../../src/application/services/ProjectService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { Project } from '../../../src/domain/models';

describe('ProjectService.updateProject (編集・更新)', () => {
  let service: ProjectService;

  beforeEach(async () => {
    RepositoryRegistry.clear();
    service = new ProjectService();

    // テスト用の追加データをセットアップ
    const repo = RepositoryRegistry.getProjectRepository();
    await repo.save(new Project('PJ002', '新規製品開発プロジェクト'));
  });

  it('正常な名称にプロジェクト名を更新できること', async () => {
    await service.updateProject({ id: 'PJ002', name: '更新後のプロジェクト名' });

    const projects = await service.getProjects();
    expect(projects[1].name).toBe('更新後のプロジェクト名');
  });

  it('自分自身と同じ名称を設定した場合は、重複エラーにならず更新できること', async () => {
    // PJ002 の名前は「新規製品開発プロジェクト」。そのまま同じ名前で更新
    await expect(service.updateProject({ id: 'PJ002', name: '新規製品開発プロジェクト' }))
      .resolves.not.toThrow();
  });

  it('変更後の名前が自分以外の既存プロジェクト名と重複する場合はエラーになること', async () => {
    // PJ002 の名前を、PJ001（シード）の名前である「次世代基幹システム開発プロジェクト」に変更しようとする
    await expect(service.updateProject({ id: 'PJ002', name: '次世代基幹システム開発プロジェクト' }))
      .rejects.toThrow('プロジェクト名「次世代基幹システム開発プロジェクト」は既に登録されています。');
  });

  it('変更後の名前の前後の空白がトリミングされて更新されること', async () => {
    await service.updateProject({ id: 'PJ002', name: '   トリミング編集テスト   ' });

    const projects = await service.getProjects();
    expect(projects[1].name).toBe('トリミング編集テスト');
  });

  it('変更後の名前が空欄またはスペースのみの場合は更新が拒否されエラーになること', async () => {
    await expect(service.updateProject({ id: 'PJ002', name: '' }))
      .rejects.toThrow('プロジェクト名は必須です。');

    await expect(service.updateProject({ id: 'PJ002', name: '   ' }))
      .rejects.toThrow('プロジェクト名は必須です。');
  });

  it('存在しないIDのプロジェクトを更新しようとした場合はエラーになること', async () => {
    await expect(service.updateProject({ id: 'PJ999', name: '存在しないプロジェクト' }))
      .rejects.toThrow('指定されたプロジェクト（PJ999）が見つかりません。');
  });
});

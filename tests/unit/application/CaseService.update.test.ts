import { describe, it, expect, beforeEach } from 'vitest';
import { CaseService } from '../../../src/application/services/CaseService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseRepository } from '../../../src/infrastructure/persistence/InMemoryCaseRepository';
import { LocalStorageProjectRepository } from '../../../src/infrastructure/persistence/LocalStorageProjectRepository';

describe('CaseService.updateCase (更新)', () => {
  let service: CaseService;

  beforeEach(async () => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerCaseRepository(new InMemoryCaseRepository());
    
    const projectRepo = new LocalStorageProjectRepository();
    const { Project } = await import('../../../src/domain/models');
    await projectRepo.save(new Project('PJ001', '次世代基幹システム開発プロジェクト'));
    RepositoryRegistry.registerProjectRepository(projectRepo);
    
    service = new CaseService();
  });

  it('正常パラメータで案件情報が更新できること', async () => {
    // 既存 AJ001 を更新
    await service.updateCase({
      projectId: 'PJ001',
      id: 'AJ001',
      name: '案件1: Ａソフト開発支援 (期間延長)',
      startDate: '2026-08-15',
      endDate: '2026-12-31'
    });

    const cases = await service.getCasesByProject('PJ001');
    const target = cases.find(c => c.id === 'AJ001');
    expect(target).toBeDefined();
    expect(target?.name).toBe('案件1: Ａソフト開発支援 (期間延長)');
    expect(target?.endDate).toBe('2026-12-31');
  });

  it('自身の案件名を変更しない（期間のみ変更等）場合、重複エラーにならず更新できること', async () => {
    await service.updateCase({
      projectId: 'PJ001',
      id: 'AJ001',
      name: '案件1: Ａソフト開発支援', // 変更なし
      startDate: '2026-08-15',
      endDate: '2026-11-30' // 期間のみ延長
    });

    const cases = await service.getCasesByProject('PJ001');
    const target = cases.find(c => c.id === 'AJ001');
    expect(target?.endDate).toBe('2026-11-30');
  });

  it('同一プロジェクト内で他の案件名と重複する場合、更新が拒否されること', async () => {
    // AJ002 の名前を AJ001 の名前「案件1: Ａソフト開発支援」に書き換えようとする
    await expect(service.updateCase({
      projectId: 'PJ001',
      id: 'AJ002',
      name: '案件1: Ａソフト開発支援',
      startDate: '2026-09-13',
      endDate: '2026-10-31'
    })).rejects.toThrow('この案件名は同一プロジェクト内にすでに登録されています。');
  });

  it('不正な期間（開始日 > 終了日）への更新が拒否されること', async () => {
    await expect(service.updateCase({
      projectId: 'PJ001',
      id: 'AJ001',
      name: '期間不正テスト',
      startDate: '2026-11-01',
      endDate: '2026-10-31'
    })).rejects.toThrow('開始日は終了日以前の日付で入力してください。');
  });

  it('存在しない案件を更新しようとした場合、エラーをスローすること', async () => {
    await expect(service.updateCase({
      projectId: 'PJ001',
      id: 'AJ999', // 存在しない案件ID
      name: '存在しないテスト',
      startDate: '2026-10-01',
      endDate: '2026-10-31'
    })).rejects.toThrow('指定された案件は存在しません。');
  });
});

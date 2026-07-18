import { describe, it, expect, beforeEach } from 'vitest';
import { CaseService } from '../../../src/application/services/CaseService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseRepository } from '../../../src/infrastructure/persistence/InMemoryCaseRepository';
import { LocalStorageProjectRepository } from '../../../src/infrastructure/persistence/LocalStorageProjectRepository';

describe('CaseService.createCase (新規登録)', () => {
  let service: CaseService;

  beforeEach(async () => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerCaseRepository(new InMemoryCaseRepository());
    
    const projectRepo = new LocalStorageProjectRepository();
    // テストに必要なプロジェクトデータを明示的に保存
    const { Project } = await import('../../../src/domain/models');
    await projectRepo.save(new Project('PJ001', '次世代基幹システム開発プロジェクト'));
    await projectRepo.save(new Project('PJ002', 'プロジェクトB'));
    
    RepositoryRegistry.registerProjectRepository(projectRepo);
    service = new CaseService();
  });

  it('正常パラメータで新規登録が成功し、案件IDがプロジェクト単位で自動採番されること', async () => {
    // PJ001 の既存最大案件IDは AJ002 (シードデータ)
    // PJ001 に新規追加
    const result1 = await service.createCase({
      projectId: 'PJ001',
      name: '案件3: Ｃシステム開発支援',
      startDate: '2026-10-01',
      endDate: '2026-12-31'
    });

    expect(result1.projectId).toBe('PJ001');
    expect(result1.id).toBe('AJ003'); // PJ001内最大値 AJ002 + 1
    expect(result1.name).toBe('案件3: Ｃシステム開発支援');
    expect(result1.startDate).toBe('2026-10-01');
    expect(result1.endDate).toBe('2026-12-31');

    // 別のプロジェクト PJ002 に対して初めて追加
    const result2 = await service.createCase({
      projectId: 'PJ002',
      name: 'プロジェクト初期設計支援',
      startDate: '2026-08-01',
      endDate: '2026-09-30'
    });

    expect(result2.projectId).toBe('PJ002');
    expect(result2.id).toBe('AJ001'); // PJ002では初めてなので AJ001 から開始
  });

  it('入力された案件名の前後スペース (全角・半角) が自動的にトリミングされて登録されること', async () => {
    const result = await service.createCase({
      projectId: 'PJ001',
      name: ' 　案件名トリミングテスト　 ',
      startDate: '2026-10-01',
      endDate: '2026-12-31'
    });

    expect(result.name).toBe('案件名トリミングテスト');
  });

  it('不正なパラメータ (空文字列、日付不正、順序不正) の登録がエラーでブロックされること', async () => {
    // 案件名空
    await expect(service.createCase({
      projectId: 'PJ001',
      name: '   ',
      startDate: '2026-10-01',
      endDate: '2026-12-31'
    })).rejects.toThrow('案件名は必須です。');

    // 日付順序不正
    await expect(service.createCase({
      projectId: 'PJ001',
      name: '日付順序テスト',
      startDate: '2026-11-01',
      endDate: '2026-10-31' // 開始日より過去
    })).rejects.toThrow('開始日は終了日以前の日付で入力してください。');

    // 存在しないプロジェクトID
    await expect(service.createCase({
      projectId: 'PJ999', // 未登録プロジェクト
      name: 'PJ存在チェックテスト',
      startDate: '2026-10-01',
      endDate: '2026-12-31'
    })).rejects.toThrow('指定されたプロジェクトは登録されていません。');
  });

  it('同一プロジェクト内での同名案件の登録がエラーで拒否されること', async () => {
    // PJ001 にはすでに「案件1: Ａソフト開発支援」が登録されている
    await expect(service.createCase({
      projectId: 'PJ001',
      name: '案件1: Ａソフト開発支援',
      startDate: '2026-10-01',
      endDate: '2026-12-31'
    })).rejects.toThrow('この案件名は同一プロジェクト内にすでに登録されています。');

    // 異なるプロジェクト PJ002 に対して同じ名前を登録した場合は、許容されること
    const result = await service.createCase({
      projectId: 'PJ002',
      name: '案件1: Ａソフト開発支援',
      startDate: '2026-10-01',
      endDate: '2026-12-31'
    });

    expect(result.id).toBe('AJ001');
    expect(result.name).toBe('案件1: Ａソフト開発支援');
  });
});

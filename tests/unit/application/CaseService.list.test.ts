import { describe, it, expect, beforeEach } from 'vitest';
import { CaseService } from '../../../src/application/services/CaseService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseRepository } from '../../../src/infrastructure/persistence/InMemoryCaseRepository';
import { Case } from '../../../src/domain/models';

describe('CaseService.getCases (一覧取得)', () => {
  let service: CaseService;

  beforeEach(() => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerCaseRepository(new InMemoryCaseRepository());
    service = new CaseService();
  });

  it('初期状態ではデータ無しの状態（0件）であること', async () => {
    const list = await service.getCases();
    expect(list).toHaveLength(0);
  });

  it('プロジェクト別での絞り込み取得ができること', async () => {
    const repo = RepositoryRegistry.getCaseRepository();
    await repo.save(new Case('PJ001', 'AJ001', '案件1: Ａソフト開発支援', '2026-08-15', '2026-11-15'));
    await repo.save(new Case('PJ001', 'AJ002', '案件2: Ｂエンジニアリング開発支援', '2026-09-13', '2026-10-31'));
    await repo.save(new Case('PJ002', 'AJ001', 'PJ2案件1', '2026-10-01', '2026-11-01'));

    const list = await service.getCasesByProject('PJ001');
    expect(list).toHaveLength(2);
  });

  it('複数登録されている場合、プロジェクトID、案件IDの順でソートされて取得できること', async () => {
    const repo = RepositoryRegistry.getCaseRepository();
    
    await repo.save(new Case('PJ001', 'AJ001', '案件1: Ａソフト開発支援', '2026-08-15', '2026-11-15'));
    await repo.save(new Case('PJ001', 'AJ002', '案件2: Ｂエンジニアリング開発支援', '2026-09-13', '2026-10-31'));
    await repo.save(new Case('PJ002', 'AJ001', 'PJ2案件', '2026-10-01', '2026-11-01'));
    await repo.save(new Case('PJ001', 'AJ003', 'PJ1案件3', '2026-10-01', '2026-11-01'));

    const list = await service.getCases();

    expect(list).toHaveLength(4);
    expect(list[0].projectId).toBe('PJ001');
    expect(list[0].id).toBe('AJ001');
    
    expect(list[1].projectId).toBe('PJ001');
    expect(list[1].id).toBe('AJ002');

    expect(list[2].projectId).toBe('PJ001');
    expect(list[2].id).toBe('AJ003');

    expect(list[3].projectId).toBe('PJ002');
    expect(list[3].id).toBe('AJ001');
  });
});

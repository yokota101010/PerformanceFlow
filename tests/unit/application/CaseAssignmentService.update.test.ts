import { describe, it, expect, beforeEach } from 'vitest';
import { CaseAssignmentService } from '../../../src/application/services/CaseAssignmentService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseAssignmentRepository } from '../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { LocalStorageProjectRepository } from '../../../src/infrastructure/persistence/LocalStorageProjectRepository';
import { InMemoryCaseRepository } from '../../../src/infrastructure/persistence/InMemoryCaseRepository';

describe('CaseAssignmentService.update (情報更新とバリデーション)', () => {
  let service: CaseAssignmentService;
  let caseAssignmentRepo: InMemoryCaseAssignmentRepository;

  beforeEach(async () => {
    RepositoryRegistry.clear();
    caseAssignmentRepo = new InMemoryCaseAssignmentRepository();
    RepositoryRegistry.registerCaseAssignmentRepository(caseAssignmentRepo);
    
    const projectRepo = new LocalStorageProjectRepository();
    const { Project } = await import('../../../src/domain/models');
    await projectRepo.save(new Project('PJ001', '次世代基幹システム開発プロジェクト'));
    RepositoryRegistry.registerProjectRepository(projectRepo);

    const caseRepo = new InMemoryCaseRepository();
    const { Case } = await import('../../../src/domain/models');
    await caseRepo.save(new Case('PJ001', 'AJ001', '案件1: Ａソフト開発支援', '2026-08-15', '2026-11-15'));
    RepositoryRegistry.registerCaseRepository(caseRepo);

    service = new CaseAssignmentService();
  });

  it('既存明細の工数や単価を正しく更新でき、売上・粗利率が再計算されること', async () => {
    // WK001: 元データ (PJ001, AJ001, 2026-08-15 〜 2026-09-30, 10.0, 800000, cost 5242000)
    // 契約工数を 8.0 に変更
    const cmd = {
      projectId: 'PJ001',
      id: 'WK001',
      startDate: '2026-08-15',
      contractEffort: 8.0,
      contractPrice: 800000
    };

    await service.updateAssignment(cmd);

    const updated = await caseAssignmentRepo.findById('WK001');
    expect(updated).toBeDefined();
    expect(updated!.contractEffort).toBe(8.0);
    expect(updated!.sales).toBe(6400000); // 8.0 * 800000 = 6400000
    expect(updated!.cost).toBe(5242000);
    expect(updated!.grossProfit).toBe(1158000); // 6400000 - 5242000 = 1158000
    expect(updated!.grossProfitRate).toBe(0.18); // 1158000 / 6400000 = 0.1809 -> 0.18
  });

  it('更新時に開始日をずらし、期間隙間を発生させた場合は更新エラーとなること', async () => {
    // WK001 の開始日を 2026-08-15 から 2026-08-20 に変更
    // これにより 08-15 〜 08-19 の期間隙間が発生する
    const cmd = {
      projectId: 'PJ001',
      id: 'WK001',
      startDate: '2026-08-20',
      contractEffort: 10.0,
      contractPrice: 800000
    };

    await expect(service.updateAssignment(cmd)).rejects.toThrow(
      '案件の全期間をカバーするように明細を登録してください（隙間が存在します）。'
    );
  });
});

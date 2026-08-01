import { describe, it, expect, beforeEach } from 'vitest';
import { CaseAssignmentService } from '../../../src/application/services/CaseAssignmentService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { InMemoryCaseAssignmentRepository } from '../../../src/infrastructure/persistence/InMemoryCaseAssignmentRepository';
import { LocalStorageProjectRepository } from '../../../src/infrastructure/persistence/LocalStorageProjectRepository';
import { InMemoryOtherExpenseRepository } from '../../../src/infrastructure/persistence/InMemoryOtherExpenseRepository';

describe('CaseAssignmentService.list (一覧・初期データ)', () => {
  let service: CaseAssignmentService;

  beforeEach(async () => {
    RepositoryRegistry.clear();
    RepositoryRegistry.registerCaseAssignmentRepository(new InMemoryCaseAssignmentRepository());
    
    // その他経費のシード設定
    const expenseRepo = new InMemoryOtherExpenseRepository();
    expenseRepo.setSum('PJ001', 'WK001', 62000);
    expenseRepo.setSum('PJ001', 'WK002', 35000);
    RepositoryRegistry.registerOtherExpenseRepository(expenseRepo);

    // プロジェクトマスタに PJ001 を登録（バリデーション用）
    const projectRepo = new LocalStorageProjectRepository();
    const { Project } = await import('../../../src/domain/models');
    await projectRepo.save(new Project('PJ001', '基幹基盤システム刷新プロジェクト'));
    RepositoryRegistry.registerProjectRepository(projectRepo);

    service = new CaseAssignmentService();
  });

  it('初期状態ではデータ無しの状態（0件）であること', async () => {
    const list = await service.getAssignments();
    expect(list.length).toBe(0);
  });

  it('登録した案件作業明細が取得され、自動計算項目が正しく算出されること', async () => {
    const { CaseAssignment } = await import('../../../src/domain/models');
    const assignRepo = RepositoryRegistry.getCaseAssignmentRepository();
    await assignRepo.save(new CaseAssignment('PJ001', 'WK001', 'AJ001', '2026-08-15', '2026-09-30', 10.0, 800000, 5242000));

    const list = await service.getAssignments();
    expect(list.length).toBe(1);

    const wk001 = list.find((a) => a.id === 'WK001');
    expect(wk001).toBeDefined();
    expect(wk001!.projectId).toBe('PJ001');
    expect(wk001!.caseId).toBe('AJ001');
    expect(wk001!.contractEffort).toBe(10.0);
    expect(wk001!.contractPrice).toBe(800000);
    expect(wk001!.sales).toBe(8000000);
    expect(wk001!.cost).toBe(62000);
    expect(wk001!.grossProfit).toBe(7938000);
    expect(wk001!.grossProfitRate).toBe(0.99);
  });
});

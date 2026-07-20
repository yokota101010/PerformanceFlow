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
    await projectRepo.save(new Project('PJ001', '次世代基幹システム開発プロジェクト'));
    RepositoryRegistry.registerProjectRepository(projectRepo);

    service = new CaseAssignmentService();
  });

  it('初期ロード時に4件のシードデータが取得され、自動計算項目が仕様書通り設定されていること', async () => {
    const list = await service.getAssignments();
    expect(list.length).toBe(4);

    // WK001の検証
    const wk001 = list.find((a) => a.id === 'WK001');
    expect(wk001).toBeDefined();
    expect(wk001!.projectId).toBe('PJ001');
    expect(wk001!.caseId).toBe('AJ001');
    expect(wk001!.startDate).toBe('2026-08-15');
    expect(wk001!.endDate).toBe('2026-09-30');
    expect(wk001!.contractEffort).toBe(10.0);
    expect(wk001!.contractPrice).toBe(800000);
    expect(wk001!.sales).toBe(8000000);
    expect(wk001!.cost).toBe(5242000);
    expect(wk001!.grossProfit).toBe(2758000);
    expect(wk001!.grossProfitRate).toBe(0.34);

    // WK003の検証 (粗利率がマイナスのケース)
    const wk003 = list.find((a) => a.id === 'WK003');
    expect(wk003).toBeDefined();
    expect(wk003!.sales).toBe(1400000);
    expect(wk003!.cost).toBe(2490000);
    expect(wk003!.grossProfit).toBe(-1090000);
    expect(wk003!.grossProfitRate).toBe(-0.78);
  });
});

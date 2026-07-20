import { describe, it, expect, beforeEach } from 'vitest';
import { FinancialSummaryService } from '../../../src/application/services/FinancialSummaryService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';

describe('FinancialSummaryService Detail', () => {
  let service: FinancialSummaryService;

  beforeEach(() => {
    service = new FinancialSummaryService(
      RepositoryRegistry.getCaseAssignmentRepository(),
      RepositoryRegistry.getEmployeeWorkTimeRepository(),
      RepositoryRegistry.getPartnerOrderRepository(),
      RepositoryRegistry.getOtherExpenseRepository(),
      RepositoryRegistry.getProjectRepository(),
      RepositoryRegistry.getCaseRepository()
    );
  });

  it('アサイン契約ごとの売上・各原価内訳・粗利・粗利率が正しく算出されること', async () => {
    const result = await service.execute();

    expect(result.rows.length).toBe(4);

    const wk001 = result.rows.find(r => r.assignmentId === 'WK001');
    expect(wk001).toBeDefined();
    expect(wk001!.projectName).toBe('次世代基幹システム開発プロジェクト');
    expect(wk001!.caseName).toBe('案件1: Ａソフト開発支援');
    expect(wk001!.sales).toBe(8000000);
    expect(wk001!.laborCost).toBe(2880000);
    expect(wk001!.orderCost).toBe(2300000);
    expect(wk001!.expenseCost).toBe(62000);
    expect(wk001!.totalCost).toBe(5242000);
    expect(wk001!.grossProfit).toBe(2758000);
    expect(wk001!.grossProfitRate).toBe(34); // 34%
    expect(wk001!.isDeficit).toBe(false);

    // 赤字行の検証 (WK003: 粗利率 -78%)
    const wk003 = result.rows.find(r => r.assignmentId === 'WK003');
    expect(wk003).toBeDefined();
    expect(wk003!.grossProfitRate).toBeLessThan(0);
    expect(wk003!.isDeficit).toBe(true);
  });
});

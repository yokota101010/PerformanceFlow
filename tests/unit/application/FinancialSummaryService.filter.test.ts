import { describe, it, expect, beforeEach } from 'vitest';
import { FinancialSummaryService } from '../../../src/application/services/FinancialSummaryService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';

describe('FinancialSummaryService Filter', () => {
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

  it('プロジェクト名でのフィルタリングとサマリの再計算が正しく行われること', async () => {
    // '次世代基幹'で部分一致検索
    const result = await service.execute({ projectName: '次世代基幹' });

    // すべてのアサイン(4件)が '次世代基幹' に該当する
    expect(result.rows.length).toBe(4);
    expect(result.rows.every(r => r.projectName.includes('次世代基幹'))).toBe(true);

    // サマリカードの再計算結果検証
    expect(result.summary.totalSales).toBe(18800000);
    expect(result.summary.totalCost).toBe(15437000);
    expect(result.summary.totalGrossProfit).toBe(3363000);
    expect(result.summary.overallGrossProfitRate).toBe(18); // 18%
  });

  it('期間(年月)でのフィルタリングが正しく行われること', async () => {
    // 2026-08 のみに該当するものを検索（WK001は 2026-08-15〜2026-09-30 なので重なる。他は重ならない）
    const result = await service.execute({ startMonth: '2026-08', endMonth: '2026-08' });

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].assignmentId).toBe('WK001');
  });
});

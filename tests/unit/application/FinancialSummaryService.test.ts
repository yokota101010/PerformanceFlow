import { describe, it, expect, beforeEach } from 'vitest';
import { FinancialSummaryService } from '../../../src/application/services/FinancialSummaryService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';

describe('FinancialSummaryService', () => {
  let service: FinancialSummaryService;

  beforeEach(() => {
    // RepositoryRegistryの初期データ状態を利用
    const assignmentRepo = RepositoryRegistry.getCaseAssignmentRepository();
    const workTimeRepo = RepositoryRegistry.getEmployeeWorkTimeRepository();
    const partnerOrderRepo = RepositoryRegistry.getPartnerOrderRepository();
    const otherExpenseRepo = RepositoryRegistry.getOtherExpenseRepository();
    const projectRepo = RepositoryRegistry.getProjectRepository();
    const caseRepo = RepositoryRegistry.getCaseRepository();

    service = new FinancialSummaryService(
      assignmentRepo,
      workTimeRepo,
      partnerOrderRepo,
      otherExpenseRepo,
      projectRepo,
      caseRepo
    );
  });

  describe('execute', () => {
    it('全社収支サマリが正しくロード・集計されること', async () => {
      const result = await service.execute();

      // 初期シードデータWK001〜WK004の合算集計値の検証
      // 売上合計: 18,800,000円
      // 製造原価合計: 15,437,000円 (加工費 + 発注額 + その他経費)
      // 粗利: 3,363,000円
      // 全体粗利率: 18%
      expect(result.summary.totalSales).toBe(18800000);
      expect(result.summary.totalCost).toBe(15437000);
      expect(result.summary.totalGrossProfit).toBe(3363000);
      expect(result.summary.overallGrossProfitRate).toBe(18); // 18%
    });
  });
});

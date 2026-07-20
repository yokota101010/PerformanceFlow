import { describe, it, expect, beforeEach } from 'vitest';
import { MonthlyMemberWorkHoursSummaryService } from '../../../src/application/services/MonthlyMemberWorkHoursSummaryService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';

describe('MonthlyMemberWorkHoursSummaryService Sync', () => {
  let service: MonthlyMemberWorkHoursSummaryService;

  beforeEach(() => {
    // 既存リポジトリ状態をリセット
    const repo = RepositoryRegistry.getMonthlyMemberWorkHoursSummaryRepository();
    repo.deleteAll();

    service = new MonthlyMemberWorkHoursSummaryService(
      repo,
      RepositoryRegistry.getPartnerOrderRepository(),
      RepositoryRegistry.getStaffRepository(),
      RepositoryRegistry.getPartnerRepository()
    );
  });

  it('execute実行時にSoT(注文明細)から最新の工数が自動集計され、サマリリポジトリにライトバック保存されること', async () => {
    const repo = RepositoryRegistry.getMonthlyMemberWorkHoursSummaryRepository();

    // 実行前はサマリデータが 0件
    let beforeSummaries = await repo.findAll();
    expect(beforeSummaries.length).toBe(0);

    // execute() を実行してライトバックを起動
    await service.execute();

    // 実行後に 12件の集計が自動保存されていること
    const afterSummaries = await repo.findAll();
    expect(afterSummaries.length).toBe(12);

    // MEM001 の 2026-08-01 が 0.8人月で保存されていること
    const mem1_08 = afterSummaries.find(s => s.staffId === 'MEM001' && s.yearMonth === '2026-08-01');
    expect(mem1_08).toBeDefined();
    expect(mem1_08?.totalEffort).toBe(0.8);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { MonthlyMemberWorkHoursSummaryService } from '../../../src/application/services/MonthlyMemberWorkHoursSummaryService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';

describe('MonthlyMemberWorkHoursSummaryService Sync', () => {
  let service: MonthlyMemberWorkHoursSummaryService;

  beforeEach(async () => {
    RepositoryRegistry.clear();

    const summaryRepo = new (await import('../../../src/infrastructure/persistence/InMemoryMonthlyMemberWorkHoursSummaryRepository')).InMemoryMonthlyMemberWorkHoursSummaryRepository();
    RepositoryRegistry.registerMonthlyMemberWorkHoursSummaryRepository(summaryRepo);

    const partnerOrderRepo = new (await import('../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository')).InMemoryPartnerOrderRepository();
    const { PartnerOrder, OrderDetail } = await import('../../../src/domain/models/PartnerOrder');
    const details = [
      new OrderDetail('ORD001', 'MEM001', 0.8, 1000000, '2026-08-01', 'BP001', 'BP001')
    ];
    await partnerOrderRepo.save(new PartnerOrder('ORD001', 'CON001', 'BP001', '2026-08-01', details));
    RepositoryRegistry.registerPartnerOrderRepository(partnerOrderRepo);

    const staffRepo = new (await import('../../../src/infrastructure/persistence/InMemoryStaffRepository')).InMemoryStaffRepository();
    const { Staff } = await import('../../../src/domain/models');
    await staffRepo.save(new Staff('MEM001', 'BP001', '要員1'));
    RepositoryRegistry.registerStaffRepository(staffRepo);

    const partnerRepo = new (await import('../../../src/infrastructure/persistence/InMemoryPartnerRepository')).InMemoryPartnerRepository();
    const { Partner } = await import('../../../src/domain/models');
    await partnerRepo.save(new Partner('BP001', 'Aソフト開発支援'));
    RepositoryRegistry.registerPartnerRepository(partnerRepo);

    service = new MonthlyMemberWorkHoursSummaryService(
      summaryRepo,
      partnerOrderRepo,
      staffRepo,
      partnerRepo
    );
  });

  it('execute実行時にSoT(注文明細)から最新の工数が自動集計され、サマリリポジトリにライトバック保存されること', async () => {
    const repo = RepositoryRegistry.getMonthlyMemberWorkHoursSummaryRepository();

    // 実行前はサマリデータが 0件
    let beforeSummaries = await repo.findAll();
    expect(beforeSummaries.length).toBe(0);

    // execute() を実行してライトバックを起動
    await service.execute();

    // 実行後に 1件の集計が自動保存されていること
    const afterSummaries = await repo.findAll();
    expect(afterSummaries.length).toBe(1);

    // MEM001 の 2026-08-01 が 0.8人月で保存されていること
    const mem1_08 = afterSummaries.find(s => s.staffId === 'MEM001' && s.yearMonth === '2026-08-01');
    expect(mem1_08).toBeDefined();
    expect(mem1_08?.totalEffort).toBe(0.8);
  });
});

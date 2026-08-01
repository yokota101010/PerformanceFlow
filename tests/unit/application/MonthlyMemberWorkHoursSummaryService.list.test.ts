import { describe, it, expect, beforeEach } from 'vitest';
import { MonthlyMemberWorkHoursSummaryService } from '../../../src/application/services/MonthlyMemberWorkHoursSummaryService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { MonthlyMemberWorkHoursSummary } from '../../../src/domain/models/MonthlyMemberWorkHoursSummary';

describe('MonthlyMemberWorkHoursSummaryService List', () => {
  let service: MonthlyMemberWorkHoursSummaryService;

  beforeEach(async () => {
    RepositoryRegistry.clear();
    const repo = new (await import('../../../src/infrastructure/persistence/InMemoryMonthlyMemberWorkHoursSummaryRepository')).InMemoryMonthlyMemberWorkHoursSummaryRepository();
    RepositoryRegistry.registerMonthlyMemberWorkHoursSummaryRepository(repo);

    const staffRepo = new (await import('../../../src/infrastructure/persistence/InMemoryStaffRepository')).InMemoryStaffRepository();
    const { Staff } = await import('../../../src/domain/models');
    await staffRepo.save(new Staff('MEM001', 'BP001', '要員1'));
    await staffRepo.save(new Staff('MEM002', 'BP001', '要員2'));
    await staffRepo.save(new Staff('MEM003', 'BP001', '要員3'));
    await staffRepo.save(new Staff('MEM004', 'BP001', '要員4'));
    RepositoryRegistry.registerStaffRepository(staffRepo);

    const partnerRepo = new (await import('../../../src/infrastructure/persistence/InMemoryPartnerRepository')).InMemoryPartnerRepository();
    const { Partner } = await import('../../../src/domain/models');
    await partnerRepo.save(new Partner('BP001', 'Aソフト開発支援'));
    RepositoryRegistry.registerPartnerRepository(partnerRepo);

    const orderRepo = new (await import('../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository')).InMemoryPartnerOrderRepository();
    const { PartnerOrder, OrderDetail } = await import('../../../src/domain/models/PartnerOrder');
    const details = [
      new OrderDetail('ORD001', 'MEM001', 0.8, 1000000, '2026-08-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM001', 0.8, 1000000, '2026-09-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM001', 0.8, 1000000, '2026-10-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM001', 0.8, 1000000, '2026-11-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM002', 0.5, 1000000, '2026-08-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM002', 0.5, 1000000, '2026-09-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM002', 0.5, 1000000, '2026-10-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM002', 0.5, 1000000, '2026-11-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM003', 1.0, 1000000, '2026-09-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM003', 1.0, 1000000, '2026-10-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM004', 0.6, 1000000, '2026-09-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM004', 0.6, 1000000, '2026-10-01', 'BP001', 'BP001'),
    ];
    await orderRepo.save(new PartnerOrder('ORD001', 'CON001', 'BP001', '2026-08-01', details));
    RepositoryRegistry.registerPartnerOrderRepository(orderRepo);

    // シードデータを登録
    const seeds = [
      new MonthlyMemberWorkHoursSummary('MEM001', '2026-08-01', 0.8),
      new MonthlyMemberWorkHoursSummary('MEM001', '2026-09-01', 0.8),
      new MonthlyMemberWorkHoursSummary('MEM001', '2026-10-01', 0.8),
      new MonthlyMemberWorkHoursSummary('MEM001', '2026-11-01', 0.8),
      new MonthlyMemberWorkHoursSummary('MEM002', '2026-08-01', 0.5),
      new MonthlyMemberWorkHoursSummary('MEM002', '2026-09-01', 0.5),
      new MonthlyMemberWorkHoursSummary('MEM002', '2026-10-01', 0.5),
      new MonthlyMemberWorkHoursSummary('MEM002', '2026-11-01', 0.5),
      new MonthlyMemberWorkHoursSummary('MEM003', '2026-09-01', 1.0),
      new MonthlyMemberWorkHoursSummary('MEM003', '2026-10-01', 1.0),
      new MonthlyMemberWorkHoursSummary('MEM004', '2026-09-01', 0.6),
      new MonthlyMemberWorkHoursSummary('MEM004', '2026-10-01', 0.6),
    ];
    await repo.saveAll(seeds);

    service = new MonthlyMemberWorkHoursSummaryService(
      repo,
      RepositoryRegistry.getPartnerOrderRepository(),
      RepositoryRegistry.getStaffRepository(),
      RepositoryRegistry.getPartnerRepository()
    );
  });

  it('シードデータから月別の要員工数マトリクスが正しく整形されて返されること', async () => {
    // execute() 実行（ここでは同期は行わず既存データのロードをテスト）
    const result = await service.execute();

    // 表示年月は昇順ソートされ、重複が排除されていること
    expect(result.months).toEqual(['2026-08-01', '2026-09-01', '2026-10-01', '2026-11-01']);

    // レコード件数は 4件 (MEM001〜MEM004) であること
    expect(result.rows.length).toBe(4);

    const mem1 = result.rows.find(r => r.staffId === 'MEM001');
    expect(mem1).toBeDefined();
    expect(mem1?.efforts['2026-08-01']).toBe(0.8);
    expect(mem1?.efforts['2026-11-01']).toBe(0.8);

    const mem3 = result.rows.find(r => r.staffId === 'MEM003');
    expect(mem3).toBeDefined();
    expect(mem3?.efforts['2026-08-01']).toBe(0); // データがない場合は0
    expect(mem3?.efforts['2026-09-01']).toBe(1.0);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { MonthlyMemberWorkHoursSummaryService } from '../../../src/application/services/MonthlyMemberWorkHoursSummaryService';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { MonthlyMemberWorkHoursSummary } from '../../../src/domain/models/MonthlyMemberWorkHoursSummary';

describe('MonthlyMemberWorkHoursSummaryService List', () => {
  let service: MonthlyMemberWorkHoursSummaryService;

  beforeEach(async () => {
    // 既存リポジトリを一旦クリアしてシードを強制投入する
    const repo = RepositoryRegistry.getMonthlyMemberWorkHoursSummaryRepository();
    await repo.deleteAll();

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

import { describe, it, expect, beforeEach } from 'vitest';
import { PartnerOrderService } from '../../../src/application/services/PartnerOrderService';
import { InMemoryPartnerOrderRepository } from '../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository';
import { InMemoryStaffRepository } from '../../../src/infrastructure/persistence/InMemoryStaffRepository';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';
import { Staff } from '../../../src/domain/models';

describe('PartnerOrderService - Update (US3)', () => {
  let repository: InMemoryPartnerOrderRepository;
  let staffRepo: InMemoryStaffRepository;
  let service: PartnerOrderService;

  beforeEach(async () => {
    RepositoryRegistry.clear();
    repository = new InMemoryPartnerOrderRepository();
    staffRepo = new InMemoryStaffRepository();
    
    const { PartnerOrder, OrderDetail } = await import('../../../src/domain/models/PartnerOrder');
    const details = [
      new OrderDetail('ORD001', 'MEM001', 0.8, 1000000, '2026-08-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM002', 0.5, 1000000, '2026-08-01', 'BP001', 'BP001')
    ];
    await repository.save(new PartnerOrder('ORD001', 'CON001', 'BP001', '2026-08-01', details));

    RepositoryRegistry.registerPartnerOrderRepository(repository);
    RepositoryRegistry.registerStaffRepository(staffRepo);
    service = new PartnerOrderService(repository);
  });

  it('既存発注データの明細が正常に更新・追加・削除でき、合計工数・発注額が再計算されて保存されること', async () => {
    // マスタ要員の登録 (BP001所属) と単価の登録
    await staffRepo.save(new Staff('MEM001', 'BP001', '要員1'));
    await staffRepo.save(new Staff('MEM002', 'BP001', '要員2'));

    const unitPriceRepo = new (await import('../../../src/infrastructure/persistence/LocalStorageStaffUnitPriceRepository')).LocalStorageStaffUnitPriceRepository();
    const { StaffUnitPrice } = await import('../../../src/domain/models/StaffUnitPrice');
    await unitPriceRepo.save(new StaffUnitPrice('SUP001', 'MEM001', [{ unitPriceId: 'SUP001', startYearMonth: '2026-08', endYearMonth: '9999-12', price: 1000000 }]));
    await unitPriceRepo.save(new StaffUnitPrice('SUP002', 'MEM002', [{ unitPriceId: 'SUP002', startYearMonth: '2026-08', endYearMonth: '9999-12', price: 1000000 }]));
    RepositoryRegistry.registerStaffUnitPriceRepository(unitPriceRepo);


    // ORD001 (BP001) の明細を MEM001 (0.5), MEM002 (0.2) に更新
    const command = {
      orderId: 'ORD001',
      details: [
        { staffId: 'MEM001', orderEffort: 0.5 },
        { staffId: 'MEM002', orderEffort: 0.2 }
      ]
    };

    await service.updateOrderDetails(command);

    const saved = await repository.findById('ORD001');
    expect(saved).not.toBeNull();
    expect(saved?.details).toHaveLength(2);
    // 合計工数: 0.5 + 0.2 = 0.7
    expect(saved?.totalEffort).toBe(0.7);
    // 合計発注額: (0.5 * 100万) + (0.2 * 100万) = 50万 + 20万 = 70万
    expect(saved?.totalAmount).toBe(700000);

  });

  it('発注工数の上限(1.0超)バリデーションが働き、保存がブロックされること', async () => {
    await staffRepo.save(new Staff('MEM001', 'BP001', '要員1'));

    const command = {
      orderId: 'ORD001',
      details: [
        { staffId: 'MEM001', orderEffort: 1.5 } // 1.0人月超
      ]
    };

    await expect(service.updateOrderDetails(command)).rejects.toThrow(
      '発注工数は0以上1以下の範囲で入力してください。'
    );
  });

  it('要員の所属会社と発注の発注先IDが一致しない要員の登録がバリデーションでブロックされること', async () => {
    // ORD001 の発注先は BP001
    // 他社(BP002)所属の要員を登録
    await staffRepo.save(new Staff('MEM003', 'BP002', '要員3'));


    const command = {
      orderId: 'ORD001',
      details: [
        { staffId: 'MEM003', orderEffort: 0.5 }
      ]
    };

    await expect(service.updateOrderDetails(command)).rejects.toThrow(
      '要員の所属会社と発注先が一致しません。'
    );
  });
});

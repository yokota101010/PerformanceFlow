import { describe, it, expect, beforeEach } from 'vitest';
import { PartnerOrderService } from '../../../src/application/services/PartnerOrderService';
import { InMemoryPartnerOrderRepository } from '../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';

describe('PartnerOrderService - List & Get (US1)', () => {
  let repository: InMemoryPartnerOrderRepository;
  let service: PartnerOrderService;

  beforeEach(() => {
    repository = new InMemoryPartnerOrderRepository();
    // RepositoryRegistry の設定をモックリポジトリにバインド
    RepositoryRegistry.registerPartnerOrderRepository(repository);
    service = new PartnerOrderService(repository);
  });

  it('初期状態ではデータ無しの状態（0件）であること', async () => {
    const orders = await service.getOrders();
    expect(orders).toHaveLength(0);
  });

  it('指定したIDの単一発注データが取得できること', async () => {
    const { PartnerOrder, OrderDetail } = await import('../../../src/domain/models/PartnerOrder');
    const details = [
      new OrderDetail('ORD001', 'MEM001', 0.8, 1000000, '2026-08-01', 'BP001', 'BP001'),
      new OrderDetail('ORD001', 'MEM002', 0.5, 1000000, '2026-08-01', 'BP001', 'BP001')
    ];
    await repository.save(new PartnerOrder('ORD001', 'CON001', 'BP001', '2026-08-01', details));

    const order = await service.getOrderById('ORD001');
    expect(order).not.toBeNull();
    expect(order?.id).toBe('ORD001');
    expect(order?.details).toHaveLength(2);
  });

  it('存在しないIDを指定した場合にnullが返却されること', async () => {
    const order = await service.getOrderById('ORD999');
    expect(order).toBeNull();
  });
});

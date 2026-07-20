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

  it('初期状態で6件のシード発注データが取得できること', async () => {
    const orders = await service.getOrders();
    expect(orders).toHaveLength(6);

    // ORD001 の検証
    const ord001 = orders.find(o => o.id === 'ORD001');
    expect(ord001).toBeDefined();
    expect(ord001?.partnerId).toBe('BP001');
    expect(ord001?.caseAssignmentId).toBe('WK001');
    expect(ord001?.targetMonth).toBe('2026-08-01');
    // 合計工数の検証: MEM001 (0.8) + MEM002 (0.5) = 1.3
    expect(ord001?.totalEffort).toBe(1.3);
    // 合計金額の検証: 800,000 + 350,000 = 1,150,000
    expect(ord001?.totalAmount).toBe(1150000);

    // ORD005 の検証
    const ord005 = orders.find(o => o.id === 'ORD005');
    expect(ord005).toBeDefined();
    expect(ord005?.partnerId).toBe('BP002');
    expect(ord005?.caseAssignmentId).toBe('WK003');
    expect(ord005?.targetMonth).toBe('2026-09-01');
    expect(ord005?.totalEffort).toBe(1.6);
    expect(ord005?.totalAmount).toBe(1210000);
  });

  it('指定したIDの単一発注データが取得できること', async () => {
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

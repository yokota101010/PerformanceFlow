import { describe, it, expect, beforeEach } from 'vitest';
import { PartnerOrderService } from '../../../src/application/services/PartnerOrderService';
import { InMemoryPartnerOrderRepository } from '../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';

describe('PartnerOrderService - Delete (US4)', () => {
  let repository: InMemoryPartnerOrderRepository;
  let service: PartnerOrderService;

  beforeEach(async () => {
    RepositoryRegistry.clear();
    repository = new InMemoryPartnerOrderRepository();
    
    const { PartnerOrder } = await import('../../../src/domain/models/PartnerOrder');
    await repository.save(new PartnerOrder('ORD001', 'CON001', 'BP001', '2026-08-01', []));
    await repository.save(new PartnerOrder('ORD002', 'CON001', 'BP001', '2026-09-01', []));

    RepositoryRegistry.registerPartnerOrderRepository(repository);
    service = new PartnerOrderService(repository);
  });

  it('指定した発注データが正常に物理削除され、一覧から消去されること', async () => {
    const beforeList = await service.getOrders();
    expect(beforeList).toHaveLength(2);

    await service.deleteOrder('ORD001');

    const afterList = await service.getOrders();
    expect(afterList).toHaveLength(1);
    
    const deleted = await service.getOrderById('ORD001');
    expect(deleted).toBeNull();
  });

  it('存在しない発注データを削除しようとした場合にエラーを投げること', async () => {
    await expect(service.deleteOrder('ORD999')).rejects.toThrow(
      '発注データが見つかりません。'
    );
  });
});

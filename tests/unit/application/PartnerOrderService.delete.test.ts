import { describe, it, expect, beforeEach } from 'vitest';
import { PartnerOrderService } from '../../../src/application/services/PartnerOrderService';
import { InMemoryPartnerOrderRepository } from '../../../src/infrastructure/persistence/InMemoryPartnerOrderRepository';
import { RepositoryRegistry } from '../../../src/infrastructure/persistence/RepositoryRegistry';

describe('PartnerOrderService - Delete (US4)', () => {
  let repository: InMemoryPartnerOrderRepository;
  let service: PartnerOrderService;

  beforeEach(() => {
    RepositoryRegistry.clear();
    repository = new InMemoryPartnerOrderRepository();
    RepositoryRegistry.registerPartnerOrderRepository(repository);
    service = new PartnerOrderService(repository);
  });

  it('指定した発注データが正常に物理削除され、一覧から消去されること', async () => {
    // 初期状態で6件
    const beforeList = await service.getOrders();
    expect(beforeList).toHaveLength(6);

    // ORD006 を削除
    await service.deleteOrder('ORD006');

    // 削除後の確認
    const afterList = await service.getOrders();
    expect(afterList).toHaveLength(5);
    
    const deleted = await service.getOrderById('ORD006');
    expect(deleted).toBeNull();
  });

  it('存在しない発注データを削除しようとした場合にエラーを投げること', async () => {
    await expect(service.deleteOrder('ORD999')).rejects.toThrow(
      '発注データが見つかりません。'
    );
  });
});

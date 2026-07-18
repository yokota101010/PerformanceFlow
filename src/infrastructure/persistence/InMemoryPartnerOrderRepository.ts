import { PartnerOrderRepository } from '../../domain/repositories';

/**
 * テスト用および初期開発用の発注実績存在確認リポジトリ実装。
 * デフォルトでシード取引先 (BP001, BP002) を注文実績あり (true) とする。
 */
export class InMemoryPartnerOrderRepository implements PartnerOrderRepository {
  private partnerIdsWithOrders: Set<string> = new Set(['BP001', 'BP002']);

  async existsByPartnerId(partnerId: string): Promise<boolean> {
    return this.partnerIdsWithOrders.has(partnerId);
  }

  /**
   * テスト用に注文実績の有無をモック変更するヘルパー
   */
  setHasOrders(partnerId: string, hasOrders: boolean): void {
    if (hasOrders) {
      this.partnerIdsWithOrders.add(partnerId);
    } else {
      this.partnerIdsWithOrders.delete(partnerId);
    }
  }
}

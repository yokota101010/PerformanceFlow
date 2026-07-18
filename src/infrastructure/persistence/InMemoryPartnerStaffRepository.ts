import { PartnerStaffRepository } from '../../domain/repositories';

/**
 * テスト用および初期開発用の所属要員存在確認リポジトリ実装。
 * デフォルトでシード取引先 (BP001, BP002) を要員所属あり (true) とする。
 */
export class InMemoryPartnerStaffRepository implements PartnerStaffRepository {
  private partnerIdsWithStaff: Set<string> = new Set(['BP001', 'BP002']);

  async existsByPartnerId(partnerId: string): Promise<boolean> {
    return this.partnerIdsWithStaff.has(partnerId);
  }

  /**
   * テスト用に所属要員の有無をモック変更するヘルパー
   */
  setHasStaff(partnerId: string, hasStaff: boolean): void {
    if (hasStaff) {
      this.partnerIdsWithStaff.add(partnerId);
    } else {
      this.partnerIdsWithStaff.delete(partnerId);
    }
  }
}

import { StaffOrderDetailRepository } from '../../domain/repositories';

/**
 * テスト用および初期開発用の注文明細存在確認リポジトリ実装。
 * デフォルトでシード要員 (MEM001〜MEM004) を注文実績あり (true) とする。
 */
export class InMemoryStaffOrderDetailRepository implements StaffOrderDetailRepository {
  private staffIdsWithDetails: Set<string> = new Set(['MEM001', 'MEM002', 'MEM003', 'MEM004']);

  async existsByStaffId(staffId: string): Promise<boolean> {
    return this.staffIdsWithDetails.has(staffId);
  }

  /**
   * テスト用に注文実績の有無をモック変更するヘルパー
   */
  setHasDetails(staffId: string, hasDetails: boolean): void {
    if (hasDetails) {
      this.staffIdsWithDetails.add(staffId);
    } else {
      this.staffIdsWithDetails.delete(staffId);
    }
  }
}

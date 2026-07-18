import { StaffMonthlySummaryRepository } from '../../domain/repositories';

/**
 * テスト用および初期開発用の工数サマリ存在確認リポジトリ実装。
 * デフォルトでシード要員 (MEM001〜MEM004) をサマリあり (true) とする。
 */
export class InMemoryStaffMonthlySummaryRepository implements StaffMonthlySummaryRepository {
  private staffIdsWithSummaries: Set<string> = new Set(['MEM001', 'MEM002', 'MEM003', 'MEM004']);

  async existsByStaffId(staffId: string): Promise<boolean> {
    return this.staffIdsWithSummaries.has(staffId);
  }

  /**
   * テスト用にサマリの有無をモック変更するヘルパー
   */
  setHasSummaries(staffId: string, hasSummaries: boolean): void {
    if (hasSummaries) {
      this.staffIdsWithSummaries.add(staffId);
    } else {
      this.staffIdsWithSummaries.delete(staffId);
    }
  }
}

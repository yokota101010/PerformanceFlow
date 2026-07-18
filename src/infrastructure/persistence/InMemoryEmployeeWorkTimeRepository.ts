import { EmployeeWorkTimeRepository } from '../../domain/repositories';

/**
 * テスト用および初期開発用のインメモリ工数実績リポジトリ実装。
 * デフォルトで初期シード社員 (EMP001, EMP002, EMP003) を工数紐づきあり (true) とする。
 */
export class InMemoryEmployeeWorkTimeRepository implements EmployeeWorkTimeRepository {
  private hasWorkTimeIds: Set<string> = new Set(['EMP001', 'EMP002', 'EMP003']);

  async existsByEmployeeId(employeeId: string): Promise<boolean> {
    return this.hasWorkTimeIds.has(employeeId);
  }

  /**
   * テスト用に工数実績の有無をモック切り替えするヘルパー
   */
  setHasWorkTime(employeeId: string, hasWorkTime: boolean): void {
    if (hasWorkTime) {
      this.hasWorkTimeIds.add(employeeId);
    } else {
      this.hasWorkTimeIds.delete(employeeId);
    }
  }
}

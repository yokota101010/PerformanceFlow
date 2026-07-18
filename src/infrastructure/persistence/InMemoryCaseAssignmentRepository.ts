import { CaseAssignmentRepository } from '../../domain/repositories';

/**
 * テスト用および初期開発用のアサイン存在確認リポジトリ実装。
 * デフォルトでシード案件をアサイン実績あり (true) とする。
 */
export class InMemoryCaseAssignmentRepository implements CaseAssignmentRepository {
  private assignedCases: Set<string> = new Set([
    'PJ001:AJ001',
    'PJ001:AJ002'
  ]);

  async existsByCaseId(projectId: string, caseId: string): Promise<boolean> {
    return this.assignedCases.has(`${projectId}:${caseId}`);
  }

  /**
   * テスト用にアサイン実績の有無をモック変更するヘルパー
   */
  setHasAssignment(projectId: string, caseId: string, hasAssignment: boolean): void {
    const key = `${projectId}:${caseId}`;
    if (hasAssignment) {
      this.assignedCases.add(key);
    } else {
      this.assignedCases.delete(key);
    }
  }
}

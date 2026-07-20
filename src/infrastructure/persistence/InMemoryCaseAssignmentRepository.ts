import { CaseAssignment } from '../../domain/models';
import { CaseAssignmentRepository } from '../../domain/repositories';

/**
 * テスト用および初期開発用の案件作業明細（アサイン契約）インメモリリポジトリ実装。
 */
export class InMemoryCaseAssignmentRepository implements CaseAssignmentRepository {
  private assignments: Map<string, CaseAssignment> = new Map();

  constructor() {
    this.initializeSeedData();
  }

  private initializeSeedData(): void {
    const seeds = [
      new CaseAssignment('PJ001', 'WK001', 'AJ001', '2026-08-15', '2026-09-30', 10.0, 800000, 5242000),
      new CaseAssignment('PJ001', 'WK002', 'AJ001', '2026-10-01', '2026-11-15', 10.0, 800000, 5215000),
      new CaseAssignment('PJ001', 'WK003', 'AJ002', '2026-09-13', '2026-09-30', 2.0, 700000, 2490000),
      new CaseAssignment('PJ001', 'WK004', 'AJ002', '2026-10-01', '2026-10-31', 2.0, 700000, 2490000),
    ];
    for (const assignment of seeds) {
      this.assignments.set(assignment.id, assignment);
    }
  }

  async existsByCaseId(projectId: string, caseId: string): Promise<boolean> {
    return Array.from(this.assignments.values()).some(
      (a) => a.projectId === projectId && a.caseId === caseId
    );
  }

  async findAll(): Promise<readonly CaseAssignment[]> {
    return Array.from(this.assignments.values()).sort((a, b) => {
      const pComp = a.projectId.localeCompare(b.projectId);
      return pComp !== 0 ? pComp : a.id.localeCompare(b.id);
    });
  }

  async findByProjectId(projectId: string): Promise<readonly CaseAssignment[]> {
    return Array.from(this.assignments.values())
      .filter((a) => a.projectId === projectId)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async findByCaseId(projectId: string, caseId: string): Promise<readonly CaseAssignment[]> {
    return Array.from(this.assignments.values())
      .filter((a) => a.projectId === projectId && a.caseId === caseId)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  async findById(id: string): Promise<CaseAssignment | null> {
    return this.assignments.get(id) || null;
  }

  async save(assignment: CaseAssignment): Promise<void> {
    this.assignments.set(assignment.id, assignment);
  }

  async delete(id: string): Promise<void> {
    this.assignments.delete(id);
  }

  async nextIdentity(): Promise<string> {
    const list = Array.from(this.assignments.values());
    if (list.length === 0) {
      return 'WK001';
    }

    const nums = list
      .map((a) => {
        const match = a.id.match(/^WK(\d{3})$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const max = nums.length > 0 ? Math.max(...nums) : 0;
    const nextNum = max + 1;

    if (nextNum > 999) {
      throw new Error('作業契約IDの発行上限に達しました。');
    }

    return `WK${String(nextNum).padStart(3, '0')}`;
  }

  /**
   * テスト用にアサイン実績の有無をモック変更する互換ヘルパー
   */
  setHasAssignment(projectId: string, caseId: string, hasAssignment: boolean): void {
    const key = `${projectId}:WK999_${caseId}`;
    if (hasAssignment) {
      this.assignments.set(
        key,
        new CaseAssignment(projectId, 'WK999', caseId, '2026-08-15', '2026-09-30', 1.0, 500000, 0)
      );
    } else {
      for (const [k, a] of this.assignments.entries()) {
        if (a.projectId === projectId && a.caseId === caseId) {
          this.assignments.delete(k);
        }
      }
    }
  }
}

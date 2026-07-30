import { CaseAssignment } from '../../domain/models';
import { CaseAssignmentRepository } from '../../domain/repositories';

/**
 * 本番用のブラウザ LocalStorage 永続化を伴う案件作業明細（アサイン契約）リポジトリ実装。
 */
export class LocalStorageCaseAssignmentRepository implements CaseAssignmentRepository {
  private readonly STORAGE_KEY = 'performance_flow_case_assignments';

  constructor() {
    this.initializeSeedData();
  }

  private initializeSeedData(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data || (JSON.parse(data) && JSON.parse(data).length === 0)) {
        const seed = [
          new CaseAssignment('PJ001', 'CON001', 'ANK001', '2026-08-15', '2026-09-30', 10.0, 1200000, 0),
          new CaseAssignment('PJ001', 'CON002', 'ANK001', '2026-10-01', '2026-11-15', 10.0, 1200000, 0),
          new CaseAssignment('PJ001', 'CON003', 'ANK002', '2026-10-13', '2027-01-31', 4.0, 1000000, 0),
        ];
        this.saveAll(seed);
      }
    } catch (e) {
      console.error('LocalStorage initialization error:', e);
    }
  }

  private loadAll(): CaseAssignment[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(
        (item: any) =>
          new CaseAssignment(
            item.projectId,
            item.id,
            item.caseId,
            item.startDate,
            item.endDate,
            item.contractEffort,
            item.contractPrice,
            item.cost || 0
          )
      );
    } catch (e) {
      console.error('Failed to load case assignments from localStorage:', e);
      return [];
    }
  }

  private saveAll(list: CaseAssignment[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save case assignments to localStorage:', e);
    }
  }

  async findAll(): Promise<readonly CaseAssignment[]> {
    return this.loadAll().sort((a, b) => {
      const pComp = a.projectId.localeCompare(b.projectId);
      return pComp !== 0 ? pComp : a.id.localeCompare(b.id);
    });
  }

  async findByProjectId(projectId: string): Promise<readonly CaseAssignment[]> {
    return this.loadAll()
      .filter((a) => a.projectId === projectId)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async findByCaseId(projectId: string, caseId: string): Promise<readonly CaseAssignment[]> {
    return this.loadAll()
      .filter((a) => a.projectId === projectId && a.caseId === caseId)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async existsByCaseId(projectId: string, caseId: string): Promise<boolean> {
    return this.loadAll().some((a) => a.projectId === projectId && a.caseId === caseId);
  }

  async findById(id: string): Promise<CaseAssignment | null> {
    return this.loadAll().find((a) => a.id === id) || null;
  }

  async save(assignment: CaseAssignment): Promise<void> {
    const list = this.loadAll();
    const index = list.findIndex(
      (a) => a.id === assignment.id
    );
    if (index >= 0) {
      list[index] = assignment;
    } else {
      list.push(assignment);
    }
    this.saveAll(list);
  }

  async delete(id: string): Promise<void> {
    const list = this.loadAll();
    const updated = list.filter((a) => a.id !== id);
    this.saveAll(updated);
  }

  async nextIdentity(): Promise<string> {
    const list = this.loadAll();
    if (list.length === 0) {
      return 'CON001';
    }

    const nums = list
      .map((a) => {
        const match = a.id.match(/^CON(\d{3})$/) || a.id.match(/^WK(\d{3})$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const max = nums.length > 0 ? Math.max(...nums) : 0;
    const nextNum = max + 1;

    if (nextNum > 999) {
      throw new Error('作業契約IDの発行上限に達しました。');
    }

    return `CON${String(nextNum).padStart(3, '0')}`;
  }

}

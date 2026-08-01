import { EmployeeWorkTimeRepository } from '../../domain/repositories/EmployeeWorkTimeRepository';
import { EmployeeWorkTime } from '../../domain/models/EmployeeWorkTime';

/**
 * テスト用および初期開発用のインメモリ工数実績・加工費取得リポジトリ実装。
 */
export class InMemoryEmployeeWorkTimeRepository implements EmployeeWorkTimeRepository {
  private items: EmployeeWorkTime[] = [];
  
  private stubHasWorkTimeIds: Set<string> = new Set();
  private stubCaseAssignmentWorkTimes: Set<string> = new Set();
  private stubCaseAssignmentWorkTimeCosts: Map<string, number> = new Map();

  constructor() {
    this.resetToSeed();
  }

  /**
   * インメモリの状態を初期のシードデータ状態に戻す。
   */
  resetToSeed() {
    this.items = [];
  }


  async findAll(): Promise<readonly EmployeeWorkTime[]> {
    return [...this.items];
  }

  async findByKeys(caseAssignmentId: string, staffId: string, targetMonth: string): Promise<EmployeeWorkTime | null> {
    return this.items.find(
      x => x.caseAssignmentId === caseAssignmentId && x.staffId === staffId && x.targetMonth === targetMonth
    ) || null;
  }

  async existsByKeys(caseAssignmentId: string, staffId: string, targetMonth: string): Promise<boolean> {
    return this.items.some(
      x => x.caseAssignmentId === caseAssignmentId && x.staffId === staffId && x.targetMonth === targetMonth
    );
  }

  async existsByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<boolean> {
    // 新しい状態管理データがあれば優先
    const existsInItems = this.items.some(x => x.caseAssignmentId === caseAssignmentId);
    if (existsInItems) return true;
    return this.stubCaseAssignmentWorkTimes.has(`${projectId}:${caseAssignmentId}`);
  }

  async existsByEmployeeId(employeeId: string): Promise<boolean> {
    const existsInItems = this.items.some(x => x.staffId === employeeId);
    if (existsInItems) return true;
    return this.stubHasWorkTimeIds.has(employeeId);
  }

  async sumCostByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<number> {
    const key = `${projectId}:${caseAssignmentId}`;
    const sumInItems = this.items
      .filter(x => x.caseAssignmentId === caseAssignmentId)
      .reduce((sum, x) => sum + x.laborCost, 0);

    if (sumInItems > 0) return sumInItems;
    return this.stubCaseAssignmentWorkTimeCosts.get(key) || 0;
  }

  async sumByStaffAndMonth(staffId: string, targetMonth: string): Promise<number> {
    return this.items
      .filter(x => x.staffId === staffId && x.targetMonth === targetMonth)
      .reduce((sum, x) => sum + x.workHours, 0);
  }

  async save(workTime: EmployeeWorkTime): Promise<void> {
    const idx = this.items.findIndex(
      x => x.caseAssignmentId === workTime.caseAssignmentId && x.staffId === workTime.staffId && x.targetMonth === workTime.targetMonth
    );
    if (idx !== -1) {
      this.items[idx] = workTime;
    } else {
      this.items.push(workTime);
    }
  }

  async delete(caseAssignmentId: string, staffId: string, targetMonth: string): Promise<void> {
    this.items = this.items.filter(
      x => !(x.caseAssignmentId === caseAssignmentId && x.staffId === staffId && x.targetMonth === targetMonth)
    );
  }

  // 過去テスト互換用メソッド
  setHasWorkTime(employeeId: string, hasWorkTime: boolean): void {
    if (hasWorkTime) {
      this.stubHasWorkTimeIds.add(employeeId);
    } else {
      this.stubHasWorkTimeIds.delete(employeeId);
      this.items = this.items.filter(x => x.staffId !== employeeId);
    }
  }

  setHasCaseAssignmentWorkTime(projectId: string, caseAssignmentId: string, hasWorkTime: boolean, cost: number = 0): void {
    const key = `${projectId}:${caseAssignmentId}`;
    if (hasWorkTime) {
      this.stubCaseAssignmentWorkTimes.add(key);
      this.stubCaseAssignmentWorkTimeCosts.set(key, cost);
    } else {
      this.stubCaseAssignmentWorkTimes.delete(key);
      this.stubCaseAssignmentWorkTimeCosts.delete(key);
      this.items = this.items.filter(x => x.caseAssignmentId !== caseAssignmentId);
    }
  }
}

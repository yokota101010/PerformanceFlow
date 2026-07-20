import { EmployeeWorkTimeRepository } from '../../domain/repositories/EmployeeWorkTimeRepository';
import { EmployeeWorkTime } from '../../domain/models/EmployeeWorkTime';
import { RepositoryRegistry } from './RepositoryRegistry';

interface StorageItem {
  caseAssignmentId: string;
  staffId: string;
  targetMonth: string;
  workHours: number;
}

/**
 * 本番環境（ブラウザ完結型SPA）で用いる LocalStorage 永続化工数実績リポジトリ実装。
 */
export class LocalStorageEmployeeWorkTimeRepository implements EmployeeWorkTimeRepository {
  private readonly STORAGE_KEY = 'performance_flow_employee_work_times';

  constructor() {
    this.initSeedData();
  }

  private initSeedData() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      const seed: StorageItem[] = [
        { caseAssignmentId: 'WK001', staffId: 'EMP001', targetMonth: '2026-08-01', workHours: 160 },
        { caseAssignmentId: 'WK001', staffId: 'EMP001', targetMonth: '2026-09-01', workHours: 160 },
        { caseAssignmentId: 'WK002', staffId: 'EMP001', targetMonth: '2026-10-01', workHours: 160 },
        { caseAssignmentId: 'WK002', staffId: 'EMP001', targetMonth: '2026-11-01', workHours: 160 },
        { caseAssignmentId: 'WK003', staffId: 'EMP002', targetMonth: '2026-09-01', workHours: 160 },
        { caseAssignmentId: 'WK004', staffId: 'EMP002', targetMonth: '2026-10-01', workHours: 160 },
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seed));
    }
  }

  private async getPrice(staffId: string): Promise<number> {
    const empRepo = RepositoryRegistry.getEmployeeRepository();
    const emp = await empRepo.findById(staffId);
    return emp ? emp.costPerHour : 0;
  }

  async findAll(): Promise<readonly EmployeeWorkTime[]> {
    const dataStr = localStorage.getItem(this.STORAGE_KEY);
    if (!dataStr) return [];
    const rawItems: StorageItem[] = JSON.parse(dataStr);
    const result: EmployeeWorkTime[] = [];
    for (const raw of rawItems) {
      const price = await this.getPrice(raw.staffId);
      result.push(new EmployeeWorkTime({ ...raw, staffPrice: price }));
    }
    return result;
  }

  async findByKeys(caseAssignmentId: string, staffId: string, targetMonth: string): Promise<EmployeeWorkTime | null> {
    const list = await this.findAll();
    return list.find(
      x => x.caseAssignmentId === caseAssignmentId && x.staffId === staffId && x.targetMonth === targetMonth
    ) || null;
  }

  async existsByKeys(caseAssignmentId: string, staffId: string, targetMonth: string): Promise<boolean> {
    const list = await this.findAll();
    return list.some(
      x => x.caseAssignmentId === caseAssignmentId && x.staffId === staffId && x.targetMonth === targetMonth
    );
  }

  async existsByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<boolean> {
    void projectId;
    const list = await this.findAll();
    return list.some(x => x.caseAssignmentId === caseAssignmentId);
  }

  async existsByEmployeeId(employeeId: string): Promise<boolean> {
    const list = await this.findAll();
    return list.some(x => x.staffId === employeeId);
  }

  async sumCostByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<number> {
    void projectId;
    const list = await this.findAll();
    return list
      .filter(x => x.caseAssignmentId === caseAssignmentId)
      .reduce((sum, x) => sum + x.laborCost, 0);
  }

  async sumByStaffAndMonth(staffId: string, targetMonth: string): Promise<number> {
    const list = await this.findAll();
    return list
      .filter(x => x.staffId === staffId && x.targetMonth === targetMonth)
      .reduce((sum, x) => sum + x.workHours, 0);
  }

  async save(workTime: EmployeeWorkTime): Promise<void> {
    const dataStr = localStorage.getItem(this.STORAGE_KEY);
    const rawItems: StorageItem[] = dataStr ? JSON.parse(dataStr) : [];
    const idx = rawItems.findIndex(
      x => x.caseAssignmentId === workTime.caseAssignmentId && x.staffId === workTime.staffId && x.targetMonth === workTime.targetMonth
    );

    const itemToSave: StorageItem = {
      caseAssignmentId: workTime.caseAssignmentId,
      staffId: workTime.staffId,
      targetMonth: workTime.targetMonth,
      workHours: workTime.workHours,
    };

    if (idx !== -1) {
      rawItems[idx] = itemToSave;
    } else {
      rawItems.push(itemToSave);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rawItems));
  }

  async delete(caseAssignmentId: string, staffId: string, targetMonth: string): Promise<void> {
    const dataStr = localStorage.getItem(this.STORAGE_KEY);
    if (!dataStr) return;
    const rawItems: StorageItem[] = JSON.parse(dataStr);
    const filtered = rawItems.filter(
      x => !(x.caseAssignmentId === caseAssignmentId && x.staffId === staffId && x.targetMonth === targetMonth)
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
}

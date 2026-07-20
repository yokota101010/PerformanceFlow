import { MonthlyMemberWorkHoursSummary } from '../../domain/models/MonthlyMemberWorkHoursSummary';
import { MonthlyMemberWorkHoursSummaryRepository } from '../../domain/repositories/MonthlyMemberWorkHoursSummaryRepository';

export class LocalStorageMonthlyMemberWorkHoursSummaryRepository implements MonthlyMemberWorkHoursSummaryRepository {
  private readonly STORAGE_KEY = 'PF_MonthlyMemberWorkHoursSummaries';

  constructor() {
    this.initializeSeedData();
  }

  private initializeSeedData(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        const seed = [
          new MonthlyMemberWorkHoursSummary('MEM001', '2026-08-01', 0.8),
          new MonthlyMemberWorkHoursSummary('MEM001', '2026-09-01', 0.8),
          new MonthlyMemberWorkHoursSummary('MEM001', '2026-10-01', 0.8),
          new MonthlyMemberWorkHoursSummary('MEM001', '2026-11-01', 0.8),
          new MonthlyMemberWorkHoursSummary('MEM002', '2026-08-01', 0.5),
          new MonthlyMemberWorkHoursSummary('MEM002', '2026-09-01', 0.5),
          new MonthlyMemberWorkHoursSummary('MEM002', '2026-10-01', 0.5),
          new MonthlyMemberWorkHoursSummary('MEM002', '2026-11-01', 0.5),
          new MonthlyMemberWorkHoursSummary('MEM003', '2026-09-01', 1.0),
          new MonthlyMemberWorkHoursSummary('MEM003', '2026-10-01', 1.0),
          new MonthlyMemberWorkHoursSummary('MEM004', '2026-09-01', 0.6),
          new MonthlyMemberWorkHoursSummary('MEM004', '2026-10-01', 0.6),
        ];
        this.saveAllData(seed);
      }
    } catch (e) {
      console.error('LocalStorage initialization error:', e);
    }
  }

  private loadAllData(): MonthlyMemberWorkHoursSummary[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(
        (item: any) =>
          new MonthlyMemberWorkHoursSummary(
            item.staffId,
            item.yearMonth,
            item.totalEffort
          )
      );
    } catch (e) {
      console.error('Failed to load monthly member work hours summary from localStorage:', e);
      return [];
    }
  }

  private saveAllData(list: MonthlyMemberWorkHoursSummary[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save monthly member work hours summary to localStorage:', e);
    }
  }

  async findByKeys(staffId: string, yearMonth: string): Promise<MonthlyMemberWorkHoursSummary | null> {
    const list = this.loadAllData();
    return list.find((item) => item.staffId === staffId && item.yearMonth === yearMonth) || null;
  }

  async findAll(): Promise<readonly MonthlyMemberWorkHoursSummary[]> {
    return this.loadAllData();
  }

  async save(summary: MonthlyMemberWorkHoursSummary): Promise<void> {
    const list = this.loadAllData();
    const index = list.findIndex(
      (item) => item.staffId === summary.staffId && item.yearMonth === summary.yearMonth
    );
    if (index >= 0) {
      list[index] = summary;
    } else {
      list.push(summary);
    }
    this.saveAllData(list);
  }

  async saveAll(summaries: MonthlyMemberWorkHoursSummary[]): Promise<void> {
    const list = this.loadAllData();
    for (const summary of summaries) {
      const index = list.findIndex(
        (item) => item.staffId === summary.staffId && item.yearMonth === summary.yearMonth
      );
      if (index >= 0) {
        list[index] = summary;
      } else {
        list.push(summary);
      }
    }
    this.saveAllData(list);
  }

  async delete(staffId: string, yearMonth: string): Promise<void> {
    const list = this.loadAllData();
    const filtered = list.filter((item) => !(item.staffId === staffId && item.yearMonth === yearMonth));
    this.saveAllData(filtered);
  }

  async deleteAll(): Promise<void> {
    this.saveAllData([]);
  }
}

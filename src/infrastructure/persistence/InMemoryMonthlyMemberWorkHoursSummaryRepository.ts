import { MonthlyMemberWorkHoursSummary } from '../../domain/models/MonthlyMemberWorkHoursSummary';
import { MonthlyMemberWorkHoursSummaryRepository } from '../../domain/repositories/MonthlyMemberWorkHoursSummaryRepository';

export class InMemoryMonthlyMemberWorkHoursSummaryRepository implements MonthlyMemberWorkHoursSummaryRepository {
  private summaries: Map<string, MonthlyMemberWorkHoursSummary> = new Map();

  constructor() {
    this.initializeSeedData();
  }

  private initializeSeedData(): void {
    // 仕様書で定められたシードデータ (12件) をロード
    const seeds = [
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
    for (const summary of seeds) {
      this.summaries.set(`${summary.staffId}:${summary.yearMonth}`, summary);
    }
  }

  async findByKeys(staffId: string, yearMonth: string): Promise<MonthlyMemberWorkHoursSummary | null> {
    return this.summaries.get(`${staffId}:${yearMonth}`) || null;
  }

  async findAll(): Promise<readonly MonthlyMemberWorkHoursSummary[]> {
    return Array.from(this.summaries.values());
  }

  async save(summary: MonthlyMemberWorkHoursSummary): Promise<void> {
    this.summaries.set(`${summary.staffId}:${summary.yearMonth}`, summary);
  }

  async saveAll(summaries: MonthlyMemberWorkHoursSummary[]): Promise<void> {
    for (const summary of summaries) {
      await this.save(summary);
    }
  }

  async delete(staffId: string, yearMonth: string): Promise<void> {
    this.summaries.delete(`${staffId}:${yearMonth}`);
  }

  async deleteAll(): Promise<void> {
    this.summaries.clear();
  }
}

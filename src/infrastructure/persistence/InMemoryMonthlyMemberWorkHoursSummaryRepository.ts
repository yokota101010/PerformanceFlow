import { MonthlyMemberWorkHoursSummary } from '../../domain/models/MonthlyMemberWorkHoursSummary';
import { MonthlyMemberWorkHoursSummaryRepository } from '../../domain/repositories/MonthlyMemberWorkHoursSummaryRepository';

export class InMemoryMonthlyMemberWorkHoursSummaryRepository implements MonthlyMemberWorkHoursSummaryRepository {
  private summaries: Map<string, MonthlyMemberWorkHoursSummary> = new Map();

  constructor() {
    this.initializeSeedData();
  }

  private initializeSeedData(): void {
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

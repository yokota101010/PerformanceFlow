import { MonthlyMemberWorkHoursSummary } from '../models/MonthlyMemberWorkHoursSummary';

export interface MonthlyMemberWorkHoursSummaryRepository {
  findByKeys(staffId: string, yearMonth: string): Promise<MonthlyMemberWorkHoursSummary | null>;
  findAll(): Promise<readonly MonthlyMemberWorkHoursSummary[]>;
  save(summary: MonthlyMemberWorkHoursSummary): Promise<void>;
  saveAll(summaries: MonthlyMemberWorkHoursSummary[]): Promise<void>;
  delete(staffId: string, yearMonth: string): Promise<void>;
  deleteAll(): Promise<void>;
}
export const MonthlyMemberWorkHoursSummaryRepositoryToken = Symbol('MonthlyMemberWorkHoursSummaryRepository');

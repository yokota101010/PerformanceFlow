export interface MonthlyMemberWorkHoursRowDTO {
  staffId: string;
  staffName: string;
  companyName: string;
  efforts: Record<string, number>; // キーは "YYYY-MM-01" 形式、値は合計工数
}

export interface MonthlyMemberWorkHoursSummaryDTO {
  months: string[]; // 表示対象の年月リスト（昇順ソート済み、例: ["2026-08-01", "2026-09-01", ...]）
  rows: MonthlyMemberWorkHoursRowDTO[];
}

export interface MonthlyMemberWorkHoursSummaryUseCase {
  execute(): Promise<MonthlyMemberWorkHoursSummaryDTO>;
}

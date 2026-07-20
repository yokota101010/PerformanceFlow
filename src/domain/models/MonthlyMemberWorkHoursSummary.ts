export class MonthlyMemberWorkHoursSummary {
  constructor(
    public readonly staffId: string,
    public readonly yearMonth: string,
    public readonly totalEffort: number
  ) {
    if (totalEffort < 0) {
      throw new Error('合計工数は0以上でなければなりません。');
    }
  }
}

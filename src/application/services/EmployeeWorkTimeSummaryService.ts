import { RepositoryRegistry } from '../../infrastructure/persistence/RepositoryRegistry';

export interface EmployeeWorkTimeSummaryRow {
  employeeId: string;
  employeeName: string;
  yearMonth: string;
  totalWorkHours: number;
  unitPrice: number;
  totalCost: number;
}

export class EmployeeWorkTimeSummaryService {
  async getSummary(yearMonth?: string): Promise<EmployeeWorkTimeSummaryRow[]> {
    const employeeRepo = RepositoryRegistry.getEmployeeRepository();
    const workTimeRepo = RepositoryRegistry.getEmployeeWorkTimeRepository();
    const unitPriceRepo = RepositoryRegistry.getEmployeeUnitPriceRepository();

    const employees = await employeeRepo.findAll();
    const allWorkTimes = await workTimeRepo.findAll();
    const allUnitPrices = await unitPriceRepo.findAll();

    const filteredWorkTimes = yearMonth
      ? allWorkTimes.filter((w) => w.targetMonth === yearMonth || w.targetMonth === `${yearMonth}-01`)
      : allWorkTimes;

    const summaryMap = new Map<string, { workHours: number; yearMonth: string }>();

    for (const wt of filteredWorkTimes) {
      const ym = wt.targetMonth.substring(0, 7);
      const key = `${wt.staffId}_${ym}`;
      const current = summaryMap.get(key) || { workHours: 0, yearMonth: ym };
      current.workHours += wt.workHours;
      summaryMap.set(key, current);
    }

    const rows: EmployeeWorkTimeSummaryRow[] = [];

    for (const emp of employees) {
      // 社員ごとの結果を集計
      const empEntries = Array.from(summaryMap.entries()).filter(([key]) => key.startsWith(`${emp.id}_`));

      if (empEntries.length === 0) {
        if (yearMonth) {
          const upEntity = allUnitPrices.find((u) => u.employeeId === emp.id);
          const unitPrice = upEntity ? upEntity.getPriceForMonth(yearMonth) : 0;

          rows.push({
            employeeId: emp.id,
            employeeName: emp.name,
            yearMonth: yearMonth,
            totalWorkHours: 0,
            unitPrice: unitPrice,
            totalCost: 0,
          });
        }
      } else {
        for (const [, val] of empEntries) {
          const ym = val.yearMonth;
          const upEntity = allUnitPrices.find((u) => u.employeeId === emp.id);
          const unitPrice = upEntity ? upEntity.getPriceForMonth(ym) : 0;


          const totalCost = Math.round((val.workHours / 160) * unitPrice);

          rows.push({
            employeeId: emp.id,
            employeeName: emp.name,
            yearMonth: ym,
            totalWorkHours: val.workHours,
            unitPrice,
            totalCost,
          });
        }
      }
    }

    return rows.sort((a, b) => a.employeeId.localeCompare(b.employeeId));
  }
}

import { EmployeeUnitPrice as IEmployeeUnitPrice, MonthlyEmployeeUnitPrice } from './types';
import { assertNonEmptyString, assertNonNegativeNumber, assertValidYearMonth } from '../validation/validator';

export class EmployeeUnitPrice implements IEmployeeUnitPrice {
  readonly id: string;
  readonly employeeId: string;
  readonly monthlyPrices: readonly MonthlyEmployeeUnitPrice[];

  constructor(id: string, employeeId: string, monthlyPrices: readonly MonthlyEmployeeUnitPrice[]) {
    assertNonEmptyString(id, '単価ID');
    assertNonEmptyString(employeeId, '社員ID');
    
    // startYearMonth の昇順にソート
    const sorted = [...monthlyPrices].sort((a, b) => {
      const ymA = a.startYearMonth || (a as any).yearMonth || '';
      const ymB = b.startYearMonth || (b as any).yearMonth || '';
      return ymA.localeCompare(ymB);
    });

    const computedList: MonthlyEmployeeUnitPrice[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      const startYM = (current.startYearMonth || (current as any).yearMonth || '').substring(0, 7);
      assertValidYearMonth(startYM);
      assertNonNegativeNumber(current.price, '単価');

      let endYM = '9999-12';
      if (i < sorted.length - 1) {
        const nextStart = (sorted[i + 1].startYearMonth || (sorted[i + 1] as any).yearMonth || '').substring(0, 7);
        endYM = this.computePreviousMonth(nextStart);
      }

      computedList.push({
        unitPriceId: current.unitPriceId || id,
        startYearMonth: startYM,
        endYearMonth: endYM,
        price: current.price,
      });
    }

    this.id = id;
    this.employeeId = employeeId;
    this.monthlyPrices = computedList;
  }

  private computePreviousMonth(yearMonth: string): string {
    const parts = yearMonth.split('-');
    if (parts.length < 2) return yearMonth;
    let year = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    return `${year}-${String(month).padStart(2, '0')}`;
  }

  /**
   * 指定年月 (YYYY-MM) に対する適用単価をルックアップして返却する。
   * (開始年月 <= targetYearMonth <= 終了年月の範囲で最新の改定単価を返す)
   */
  getPriceForMonth(targetYearMonth: string): number {
    const targetYM = targetYearMonth.substring(0, 7);
    let appliedPrice = 0;

    for (const item of this.monthlyPrices) {
      if (item.startYearMonth <= targetYM && targetYM <= (item.endYearMonth || '9999-12')) {
        appliedPrice = item.price;
      }
    }

    return appliedPrice;
  }
}

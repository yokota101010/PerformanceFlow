import { IEmployeeWorkTime } from './types';

/**
 * 月別案件社員工数（集約ルート）の実装クラス。
 * 憲法に定める不変性を保証するため、すべてのプロパティは readonly とし、
 * コンストラクタでビジネスルール・一貫性制約を強制検証する。
 */
export class EmployeeWorkTime implements IEmployeeWorkTime {
  readonly caseAssignmentId: string;
  readonly staffId: string;
  readonly targetMonth: string;
  readonly workHours: number;
  readonly staffPrice: number; // 計算の真実性を担保するための社員時間単価

  constructor(params: {
    caseAssignmentId: string;
    staffId: string;
    targetMonth: string;
    workHours: number;
    staffPrice: number;
  }) {
    if (!params.caseAssignmentId) {
      throw new Error('作業契約IDは必須です。');
    }
    if (!params.staffId) {
      throw new Error('社員IDは必須です。');
    }
    if (!params.targetMonth || !/^\d{4}-\d{2}-01$/.test(params.targetMonth)) {
      throw new Error('年月はYYYY-MM-01形式でなければなりません。');
    }
    if (params.workHours < 0 || params.workHours > 200 || !Number.isInteger(params.workHours)) {
      throw new Error('作業時間は0時間以上200時間以下の整数でなければなりません。');
    }
    if (params.staffPrice < 0) {
      throw new Error('時間単価は0以上でなければなりません。');
    }

    this.caseAssignmentId = params.caseAssignmentId;
    this.staffId = params.staffId;
    this.targetMonth = params.targetMonth;
    this.workHours = params.workHours;
    this.staffPrice = params.staffPrice;
  }

  /**
   * 加工費 (導出項目)
   * 単価 × 作業時間
   */
  get laborCost(): number {
    return this.workHours * this.staffPrice;
  }
}

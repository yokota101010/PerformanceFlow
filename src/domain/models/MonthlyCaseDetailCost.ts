import { MonthlyCaseDetailCost as IMonthlyCaseDetailCost } from './types';
import { assertNonEmptyString, assertNonNegativeNumber, assertValidYearMonth } from '../validation/validator';

/**
 * 月別案件明細原価集約（導出サマリ）クラス。
 * domain-model.md の「テーブル: 月別案件明細原価」に準拠。
 */
export class MonthlyCaseDetailCost implements IMonthlyCaseDetailCost {
  readonly contractId: string;
  readonly yearMonth: string;
  readonly manufacturingCost: number;
  readonly fiscalYear: string;
  readonly quarterCategory: string;
  readonly outsourcingCost: number;
  readonly employeeCost: number;
  readonly otherExpenses: number;

  constructor(
    contractId: string,
    yearMonth: string,
    outsourcingCost: number,
    employeeCost: number,
    otherExpenses: number,
    manufacturingCost?: number,
    fiscalYear?: string,
    quarterCategory?: string
  ) {
    assertNonEmptyString(contractId, '契約ID');
    assertValidYearMonth(yearMonth.substring(0, 7), '年月');
    assertNonNegativeNumber(outsourcingCost, '外注原価');
    assertNonNegativeNumber(employeeCost, '社員加工費');
    assertNonNegativeNumber(otherExpenses, 'その他経費');

    // YYYY-MM-01 形式に正規化
    const normalizedYM = yearMonth.length === 7 ? `${yearMonth}-01` : yearMonth;

    this.contractId = contractId;
    this.yearMonth = normalizedYM;
    this.outsourcingCost = outsourcingCost;
    this.employeeCost = employeeCost;
    this.otherExpenses = otherExpenses;

    // 製造原価の自動算出 (三者の合計)
    this.manufacturingCost = manufacturingCost !== undefined
      ? manufacturingCost
      : outsourcingCost + employeeCost + otherExpenses;

    // 会計年度の導出 (4〜12月は当年、1〜3月は前年、YYYY-04-01形式)
    this.fiscalYear = fiscalYear || MonthlyCaseDetailCost.deriveFiscalYear(normalizedYM);

    // 四半期区分の導出 (4〜6月: 1Q, 7〜9月: 2Q, 10〜12月: 3Q, 1〜3月: 4Q)
    this.quarterCategory = quarterCategory || MonthlyCaseDetailCost.deriveQuarterCategory(normalizedYM);
  }

  /**
   * 年月 (YYYY-MM-DD または YYYY-MM) から会計年度 (YYYY-04-01) を導出する
   */
  static deriveFiscalYear(dateStr: string): string {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const fy = (month >= 1 && month <= 3) ? year - 1 : year;
    return `${fy}-04-01`;
  }

  /**
   * 年月 (YYYY-MM-DD または YYYY-MM) から四半期区分 (1Q | 2Q | 3Q | 4Q) を導出する
   */
  static deriveQuarterCategory(dateStr: string): string {
    const parts = dateStr.split('-');
    const month = parseInt(parts[1], 10);
    if (month >= 4 && month <= 6) return '1Q';
    if (month >= 7 && month <= 9) return '2Q';
    if (month >= 10 && month <= 12) return '3Q';
    return '4Q'; // 1〜3月
  }

  // 互換用ゲッター
  get caseDetailId(): string {
    return this.contractId;
  }
}

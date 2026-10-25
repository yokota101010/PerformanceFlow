import { QuarterlyCaseDetailPerformance as IQuarterlyCaseDetailPerformance } from './types';
import { assertNonEmptyString, assertNonNegativeNumber } from '../validation/validator';

/**
 * 四半期別案件明細業績集約（導出サマリ）クラス。
 * domain-model.md の「テーブル: 四半期別案件明細業績」に準拠。
 */
export class QuarterlyCaseDetailPerformance implements IQuarterlyCaseDetailPerformance {
  readonly contractId: string;
  readonly fiscalYear: string;
  readonly quarterCategory: string;
  readonly sales: number;
  readonly manufacturingCost: number;
  readonly grossProfit: number;
  readonly grossProfitRate: number;

  constructor(
    contractId: string,
    fiscalYear: string,
    quarterCategory: string,
    manufacturingCost: number,
    totalSales: number,
    totalManufacturingCost: number,
    explicitSales?: number,
    explicitGrossProfit?: number,
    explicitGrossProfitRate?: number
  ) {
    assertNonEmptyString(contractId, '契約ID');
    assertNonEmptyString(fiscalYear, '会計年度');
    assertNonEmptyString(quarterCategory, '四半期区分');
    assertNonNegativeNumber(manufacturingCost, '製造原価');

    this.contractId = contractId;
    this.fiscalYear = fiscalYear;
    this.quarterCategory = quarterCategory;
    this.manufacturingCost = manufacturingCost;

    // 売上の導出: 総売上 × 製造原価 ÷ 総製造原価 (小数点以下第1位を四捨五入)
    if (explicitSales !== undefined) {
      this.sales = explicitSales;
    } else if (totalManufacturingCost > 0) {
      this.sales = Math.round((totalSales * manufacturingCost) / totalManufacturingCost);
    } else {
      this.sales = 0;
    }

    // 粗利の導出: 売上 - 製造原価
    this.grossProfit = explicitGrossProfit !== undefined
      ? explicitGrossProfit
      : this.sales - this.manufacturingCost;

    // 粗利率の導出: 粗利 ÷ 売上 (常時小数点以下2桁)
    if (explicitGrossProfitRate !== undefined) {
      this.grossProfitRate = explicitGrossProfitRate;
    } else if (this.sales > 0) {
      this.grossProfitRate = Math.round((this.grossProfit / this.sales) * 100) / 100;
    } else {
      this.grossProfitRate = 0.0;
    }
  }

  // 互換用ゲッター
  get caseDetailId(): string {
    return this.contractId;
  }

  get totalSales(): number {
    return this.sales;
  }

  get totalGrossProfit(): number {
    return this.grossProfit;
  }
}

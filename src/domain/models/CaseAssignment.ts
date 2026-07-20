import { CaseAssignment as ICaseAssignment } from './types';

/**
 * 案件作業明細（アサイン契約）ドメイン集約クラス。
 * 契約工数、単価、および売上や粗利・粗利率の自動計算要件を内包する。
 */
export class CaseAssignment implements ICaseAssignment {
  readonly projectId: string;
  readonly id: string;
  readonly caseId: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly contractEffort: number;
  readonly contractPrice: number;

  readonly sales: number;
  readonly cost: number;
  readonly grossProfit: number;
  readonly grossProfitRate: number;

  constructor(
    projectId: string,
    id: string,
    caseId: string,
    startDate: string,
    endDate: string,
    contractEffort: number,
    contractPrice: number,
    cost: number
  ) {
    if (!projectId) {
      throw new Error('プロジェクトIDは必須です。');
    }
    if (!id || !/^WK\d{3}$/.test(id)) {
      throw new Error('不正な作業契約ID形式です。');
    }
    if (!caseId) {
      throw new Error('案件IDは必須です。');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!startDate || !dateRegex.test(startDate)) {
      throw new Error('開始日はYYYY-MM-DD形式で入力してください。');
    }
    if (!endDate || !dateRegex.test(endDate)) {
      throw new Error('終了日はYYYY-MM-DD形式で入力してください。');
    }

    if (new Date(startDate) > new Date(endDate)) {
      throw new Error('開始日は終了日以前の日付で入力してください。');
    }

    if (contractEffort <= 0) {
      throw new Error('契約工数は0より大きい値を入力してください。');
    }
    if (contractPrice < 0) {
      throw new Error('契約単価は0以上の値を入力してください。');
    }

    this.projectId = projectId;
    this.id = id;
    this.caseId = caseId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.contractEffort = contractEffort;
    this.contractPrice = contractPrice;

    // 導出項目の自動計算 (FR-009, FR-011)
    this.sales = Math.round(contractEffort * contractPrice);
    this.cost = cost;
    this.grossProfit = this.sales - this.cost;

    if (this.sales === 0) {
      this.grossProfitRate = 0;
    } else {
      // 粗利 ÷ 売上の結果を小数点第3位四捨五入して、小数点以下第2位までに丸める
      this.grossProfitRate = Math.round((this.grossProfit / this.sales) * 100) / 100;
    }
  }
}

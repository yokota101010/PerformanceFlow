import { OtherExpense as IOtherExpense } from './types';

/**
 * その他経費（経費データ）のドメインエンティティ（集約ルート）。
 * 不変性を保証するため、すべてのプロパティは readonly とする。
 */
export class OtherExpense implements IOtherExpense {
  readonly caseAssignmentId: string;
  readonly lineNo: number;
  readonly amount: number;
  readonly memo: string;

  constructor(params: {
    caseAssignmentId: string;
    lineNo: number;
    amount: number;
    memo: string;
  }) {
    // 1. 作業契約IDの検証
    if (!params.caseAssignmentId || !params.caseAssignmentId.startsWith('WK')) {
      throw new Error('作業契約IDはWKから始まる有効なIDでなければなりません。');
    }

    // 2. 行Noの検証
    if (!Number.isInteger(params.lineNo) || params.lineNo < 1) {
      throw new Error('行Noは1以上の整数でなければなりません。');
    }

    // 3. 金額の検証
    if (!Number.isInteger(params.amount) || params.amount < 0) {
      throw new Error('金額は0以上の整数でなければなりません。');
    }

    // 4. 摘要の検証
    if (!params.memo || params.memo.trim().length === 0) {
      throw new Error('摘要は必須項目です。');
    }
    if (params.memo.length > 100) {
      throw new Error('摘要は100文字以内でなければなりません。');
    }

    this.caseAssignmentId = params.caseAssignmentId;
    this.lineNo = params.lineNo;
    this.amount = params.amount;
    this.memo = params.memo;
  }
}

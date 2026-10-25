import { OtherExpense as IOtherExpense } from './types';

/**
 * 実在する YYYY-MM-DD 形式の日付かどうかを厳格に検証する
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/**
 * その他経費（経費データ）のドメインエンティティ（集約ルート）。
 * 正本 domain-model.md（主キー: 契約ID ＋ 発生日 ＋ 行No、導出: 発生年月）に準拠。
 * 不変性を保証するため、すべてのプロパティは readonly とする。
 */
export class OtherExpense implements IOtherExpense {
  readonly caseAssignmentId: string;
  readonly occurrenceDate: string;
  readonly lineNo: number;
  readonly occurrenceYearMonth: string;
  readonly amount: number;
  readonly memo: string;
  readonly needsReview?: boolean;

  constructor(params: {
    caseAssignmentId: string;
    occurrenceDate?: string;
    lineNo: number;
    amount: number;
    memo: string;
    needsReview?: boolean;
    occurrenceYearMonth?: string;
  }) {
    // 1. 作業契約IDの検証
    if (!params.caseAssignmentId || (!params.caseAssignmentId.startsWith('CON') && !params.caseAssignmentId.startsWith('WK'))) {
      throw new Error('作業契約IDはCONまたはWKから始まる有効なIDでなければなりません。');
    }

    // 2. 発生日の検証 (FR-003)
    if (params.occurrenceDate === '') {
      throw new Error('発生日は必須です。');
    }
    if (params.occurrenceDate !== undefined && !isValidDateString(params.occurrenceDate)) {
      throw new Error('発生日は YYYY-MM-DD 形式の有効な日付で入力してください。');
    }

    // 3. 行Noの検証 (FR-004)
    if (!Number.isInteger(params.lineNo) || params.lineNo < 1) {
      throw new Error('行Noは1以上の整数でなければなりません。');
    }

    // 4. 金額の検証 (FR-007)
    if (!Number.isInteger(params.amount) || params.amount < 0) {
      throw new Error('金額は0以上の整数でなければなりません。');
    }

    // 5. 摘要の検証 (FR-008)
    if (!params.memo || params.memo.trim().length === 0) {
      throw new Error('摘要は必須項目です。');
    }
    if (params.memo.length > 100) {
      throw new Error('摘要は100文字以内でなければなりません。');
    }

    this.caseAssignmentId = params.caseAssignmentId;
    // 発生日 (未指定時は互換用デフォルト)
    this.occurrenceDate = params.occurrenceDate || '2026-08-15';
    this.lineNo = params.lineNo;
    this.amount = params.amount;
    this.memo = params.memo;
    this.needsReview = params.needsReview;

    // 6. 発生年月 (導出項目: 発生日の属する年月を YYYY-MM-01 形式で設定) (FR-005)
    this.occurrenceYearMonth = `${this.occurrenceDate.substring(0, 7)}-01`;
  }
}

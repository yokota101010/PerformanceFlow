import { OtherExpense } from '../../domain/models/OtherExpense';

export interface CreateOtherExpenseCommand {
  readonly caseAssignmentId: string;
  readonly occurrenceDate?: string; // 発生日 (YYYY-MM-DD)
  readonly amount: number;
  readonly memo: string;
}

export interface UpdateOtherExpenseCommand {
  readonly caseAssignmentId: string;
  readonly oldOccurrenceDate?: string; // 変更前発生日 (未指定時は occurrenceDate)
  readonly lineNo: number;             // 変更前行No
  readonly occurrenceDate?: string;     // 発生日 (YYYY-MM-DD)
  readonly amount: number;
  readonly memo: string;
}

/**
 * その他経費ユースケースの抽象アプリケーション契約。
 * 正本 domain-model.md（主キー: 契約ID ＋ 発生日 ＋ 行No）に準拠。
 */
export interface OtherExpenseUseCase {
  /**
   * 指定した作業契約に紐づく経費一覧を取得する（発生日昇順、行No昇順）
   */
  getOtherExpenses(caseAssignmentId: string): Promise<readonly OtherExpense[]>;

  /**
   * 新しいその他経費を登録する（発生日ごとに自動連番採番）
   */
  createOtherExpense(command: CreateOtherExpenseCommand): Promise<void>;

  /**
   * その他経費の金額・摘要・発生日を更新する（発生日変更時は新日付で自動再採番）
   */
  updateOtherExpense(command: UpdateOtherExpenseCommand): Promise<void>;

  /**
   * その他経費を物理削除する
   */
  deleteOtherExpense(caseAssignmentId: string, occurrenceDate: string, lineNo: number): Promise<void>;
  deleteOtherExpense(caseAssignmentId: string, occurrenceDateOrLineNo: string | number, lineNo?: number): Promise<void>;
}

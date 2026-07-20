import { OtherExpense } from '../../domain/models/OtherExpense';

export interface CreateOtherExpenseCommand {
  readonly caseAssignmentId: string;
  readonly amount: number;
  readonly memo: string;
}

export interface UpdateOtherExpenseCommand {
  readonly caseAssignmentId: string;
  readonly lineNo: number;
  readonly amount: number;
  readonly memo: string;
}

/**
 * その他経費ユースケースの抽象アプリケーション契約。
 */
export interface OtherExpenseUseCase {
  /**
   * 指定した作業契約に紐づく経費一覧を取得する
   */
  getOtherExpenses(caseAssignmentId: string): Promise<readonly OtherExpense[]>;

  /**
   * 新しいその他経費を登録する
   */
  createOtherExpense(command: CreateOtherExpenseCommand): Promise<void>;

  /**
   * その他経費の金額・摘要を更新する
   */
  updateOtherExpense(command: UpdateOtherExpenseCommand): Promise<void>;

  /**
   * その他経費を物理削除する
   */
  deleteOtherExpense(caseAssignmentId: string, lineNo: number): Promise<void>;
}

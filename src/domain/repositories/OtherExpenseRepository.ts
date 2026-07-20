import { OtherExpense } from '../models/OtherExpense';

/**
 * その他経費マスタ（経費データ）のデータアクセスを担うリポジトリ契約。
 * 案件作業明細の原価算出および削除制限チェックのために使用される。
 */
export interface OtherExpenseRepository {
  /**
   * 指定した作業契約（複合キー）を参照するその他経費が存在するかどうかを検証する。
   */
  existsByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<boolean>;

  /**
   * 指定した作業契約IDに関連するすべてのその他経費を取得する
   */
  findByCaseAssignmentId(caseAssignmentId: string): Promise<readonly OtherExpense[]>;

  /**
   * システム内のすべてのその他経費を取得する
   */
  findAll(): Promise<readonly OtherExpense[]>;

  /**
   * 複合キーを指定して1件のその他経費を取得する
   */
  findByKeys(caseAssignmentId: string, lineNo: number): Promise<OtherExpense | null>;

  /**
   * 新しい、または更新されたその他経費を保存する
   */
  save(otherExpense: OtherExpense): Promise<void>;

  /**
   * 指定したその他経費を物理削除する
   */
  delete(caseAssignmentId: string, lineNo: number): Promise<void>;

  /**
   * 指定した作業契約（複合キー）に紐づくその他経費の合計金額を取得する。
   */
  sumByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<number>;

  /**
   * 次の行Noを取得する
   */
  getNextLineNo(caseAssignmentId: string): Promise<number>;
}

/**
 * 案件に紐づくアサインデータ（案件作業明細）の存在確認を担うリポジトリ契約。
 * 案件削除制約チェック (US4) のために使用される。
 */
export interface CaseAssignmentRepository {
  /**
   * 指定した案件（複合キー）を参照するアサインレコードが存在するかどうかを検証する。
   * @param projectId プロジェクトID
   * @param caseId 案件ID
   * @returns レコードが存在する場合 true、存在しない場合 false
   */
  existsByCaseId(projectId: string, caseId: string): Promise<boolean>;
}

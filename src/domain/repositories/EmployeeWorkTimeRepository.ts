/**
 * 社員に紐づく工数実績データの存在確認を担うリポジトリ契約。
 * 社員削除制約チェック (US4) のために使用される。
 */
export interface EmployeeWorkTimeRepository {
  /**
   * 指定した社員IDを参照する工数実績（月別案件社員工数）レコードが存在するかどうかを検証する。
   * @param employeeId 検証対象の社員ID
   * @returns レコードが存在する場合（作業時間が0であっても） true、存在しない場合 false
   */
  existsByEmployeeId(employeeId: string): Promise<boolean>;
}

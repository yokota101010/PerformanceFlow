/**
 * 要員に紐づく要員工数サマリの存在確認を担うリポジトリ契約。
 * 要員削除制約チェック (US4) のために使用される。
 */
export interface StaffMonthlySummaryRepository {
  /**
   * 指定した要員IDを参照する工数サマリレコードが存在するかどうかを検証する。
   * @param staffId 検証対象の要員ID
   * @returns レコードが存在する場合 true、存在しない場合 false
   */
  existsByStaffId(staffId: string): Promise<boolean>;
}

/**
 * 要員に紐づく注文明細データの存在確認を担うリポジトリ契約。
 * 要員削除制約チェック (US4) のために使用される。
 */
export interface StaffOrderDetailRepository {
  /**
   * 指定した要員IDを参照する注文明細レコードが存在するかどうかを検証する。
   * @param staffId 検証対象の要員ID
   * @returns レコードが存在する場合 true、存在しない場合 false
   */
  existsByStaffId(staffId: string): Promise<boolean>;
}

/**
 * 発注先に所属する要員データの存在確認を担うリポジトリ契約。
 * 発注先削除制約チェック (US4) のために使用される。
 */
export interface PartnerStaffRepository {
  /**
   * 指定した発注先IDを参照する要員レコードが存在するかどうかを検証する。
   * @param partnerId 検証対象の発注先ID
   * @returns レコードが存在する場合 true、存在しない場合 false
   */
  existsByPartnerId(partnerId: string): Promise<boolean>;
}

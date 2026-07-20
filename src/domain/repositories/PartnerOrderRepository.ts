import { PartnerOrder } from '../models/PartnerOrder';

/**
 * パートナーに対する発注契約データの永続化を担うリポジトリ契約。
 */
export interface PartnerOrderRepository {
  /**
   * 登録済みの全発注データを取得する。
   */
  findAll(): Promise<readonly PartnerOrder[]>;

  /**
   * 注文IDから発注データを取得する。
   */
  findById(id: string): Promise<PartnerOrder | null>;

  /**
   * 作業契約IDに関連する発注データ一覧を取得する。
   */
  findByCaseAssignmentId(caseAssignmentId: string): Promise<readonly PartnerOrder[]>;

  /**
   * 同一のアサイン、年月、発注先の組み合わせの発注データが存在するか検証する (UQ1)。
   */
  existsByKeys(caseAssignmentId: string, targetMonth: string, partnerId: string): Promise<boolean>;

  /**
   * 指定した発注先IDを参照する発注レコードが存在するかどうかを検証する。
   */
  existsByPartnerId(partnerId: string): Promise<boolean>;

  /**
   * 指定した作業契約（複合キー）を参照する発注レコードが存在するかどうかを検証する。
   */
  existsByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<boolean>;

  /**
   * 指定した作業契約（複合キー）に紐づく発注の合計発注額を取得する。
   */
  sumByCaseAssignmentId(projectId: string, caseAssignmentId: string): Promise<number>;

  /**
   * 発注データを保存する。
   */
  save(order: PartnerOrder): Promise<void>;

  /**
   * 注文IDから発注データを物理削除する。
   */
  delete(id: string): Promise<void>;

  /**
   * 次の注文ID（一意）を発行する。
   */
  nextIdentity(): Promise<string>;
}

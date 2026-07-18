import { Partner } from '../models';

/**
 * 発注先集約の永続化および再構築を管理するリポジトリインターフェース。
 */
export interface PartnerRepository {
  /**
   * 登録されているすべての発注先を取得する。
   * 発注先IDの昇順でソートされたリストを返却する。
   */
  findAll(): Promise<readonly Partner[]>;

  /**
   * 指定された発注先IDに一致する発注先を取得する。
   * 存在しない場合は null を返却する。
   */
  findById(id: string): Promise<Partner | null>;

  /**
   * 指定された発注先名に一致する発注先を取得する (一意制約検証用)。
   * 存在しない場合は null を返却する。
   */
  findByName(name: string): Promise<Partner | null>;

  /**
   * 発注先を保存（新規登録または更新）する。
   */
  save(partner: Partner): Promise<void>;

  /**
   * 指定された発注先IDのデータを物理削除する。
   */
  delete(id: string): Promise<void>;

  /**
   * 次の発注先IDを自動採番して生成する（BPnnn形式、欠番再利用なし）。
   * 最大値が999に達した場合はエラーをスローする。
   */
  nextIdentity(): Promise<string>;
}

import { Staff } from '../models';

/**
 * 要員集約の永続化および再構築を管理するリポジトリインターフェース。
 */
export interface StaffRepository {
  /**
   * 登録されているすべての要員を取得する。
   * 要員IDの昇順でソートされたリストを返却する。
   */
  findAll(): Promise<readonly Staff[]>;

  /**
   * 指定された要員IDに一致する要員を取得する。
   * 存在しない場合は null を返却する。
   */
  findById(id: string): Promise<Staff | null>;

  /**
   * 要員を保存（新規登録または更新）する。
   */
  save(staff: Staff): Promise<void>;

  /**
   * 指定された要員IDのデータを物理削除する。
   */
  delete(id: string): Promise<void>;

  /**
   * 次の要員IDを自動採番して生成する（MEMnnn形式、欠番再利用なし）。
   * 最大値が999に達した場合はエラーをスローする。
   */
  nextIdentity(): Promise<string>;
}

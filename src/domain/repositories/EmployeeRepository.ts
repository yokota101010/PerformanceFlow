import { Employee } from '../models';

/**
 * 社員集約の永続化および再構築を管理するリポジトリインターフェース。
 */
export interface EmployeeRepository {
  /**
   * 登録されているすべての社員を取得する。
   * 社員IDの昇順でソートされたリストを返却する。
   */
  findAll(): Promise<readonly Employee[]>;

  /**
   * 指定された社員IDに一致する社員を取得する。
   * 存在しない場合は null を返却する。
   */
  findById(id: string): Promise<Employee | null>;

  /**
   * 社員を保存（新規登録または更新）する。
   */
  save(employee: Employee): Promise<void>;

  /**
   * 指定された社員IDのデータを物理削除する。
   */
  delete(id: string): Promise<void>;

  /**
   * 次の社員IDを自動採番して生成する（EMPnnn形式、欠番再利用なし）。
   * 最大値が999に達した場合はエラーをスローする。
   */
  nextIdentity(): Promise<string>;
}

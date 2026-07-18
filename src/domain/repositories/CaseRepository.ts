import { Case } from '../models';

/**
 * 案件集約の永続化および再構築を管理するリポジトリインターフェース。
 */
export interface CaseRepository {
  /**
   * 登録されているすべての案件を取得する。
   * プロジェクトID、案件IDの順でソートされたリストを返却する。
   */
  findAll(): Promise<readonly Case[]>;

  /**
   * 指定されたプロジェクトIDに紐づくすべての案件を取得する。
   * 案件IDの昇順でソートされたリストを返却する。
   */
  findByProjectId(projectId: string): Promise<readonly Case[]>;

  /**
   * プロジェクトIDと案件IDの複合キーに一致する案件を取得する。
   * 存在しない場合は null を返却する。
   */
  findById(projectId: string, id: string): Promise<Case | null>;

  /**
   * 案件を保存（新規登録または更新）する。
   */
  save(caseObj: Case): Promise<void>;

  /**
   * 指定された案件（複合キー）のデータを物理削除する。
   */
  delete(projectId: string, id: string): Promise<void>;

  /**
   * プロジェクト単位で次の案件IDを自動採番して生成する（AJnnn形式、欠番再利用なし）。
   * 最大値が999に達した場合はエラーをスローする。
   * @param projectId 親となるプロジェクトID
   */
  nextIdentity(projectId: string): Promise<string>;
}

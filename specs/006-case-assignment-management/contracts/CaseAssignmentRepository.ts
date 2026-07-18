import { CaseAssignment } from '../../../src/domain/models';

/**
 * 案件作業明細（アサイン契約）集約のデータアクセスおよび再構築を担うリポジトリの抽象契約。
 */
export interface CaseAssignmentRepository {
  /**
   * 登録されているすべての案件作業明細を取得する。
   * プロジェクトID、作業契約IDの順でソートされたリストを返却する。
   */
  findAll(): Promise<readonly CaseAssignment[]>;

  /**
   * 指定されたプロジェクトIDに紐づくすべての明細を取得する。
   * 作業契約IDの昇順でソートされたリストを返却する。
   */
  findByProjectId(projectId: string): Promise<readonly CaseAssignment[]>;

  /**
   * 指定されたプロジェクトIDおよび案件IDに紐づくすべての明細を取得する。
   * 開始日の昇順でソートされたリストを返却する。
   */
  findByCaseId(projectId: string, caseId: string): Promise<readonly CaseAssignment[]>;

  /**
   * プロジェクトIDと作業契約IDの複合キーに一致する明細を取得する。
   * 存在しない場合は null を返却する。
   */
  findById(projectId: string, id: string): Promise<CaseAssignment | null>;

  /**
   * 案件作業明細を保存（新規登録または更新）する。
   */
  save(assignment: CaseAssignment): Promise<void>;

  /**
   * 指定された明細（複合キー）のデータを物理削除する。
   */
  delete(projectId: string, id: string): Promise<void>;

  /**
   * プロジェクト単位で次の作業契約IDを自動採番して生成する（WKnnn形式、欠番再利用なし）。
   * 最大値が999に達した場合はエラーをスローする。
   * @param projectId 親となるプロジェクトID
   */
  nextIdentity(projectId: string): Promise<string>;
}

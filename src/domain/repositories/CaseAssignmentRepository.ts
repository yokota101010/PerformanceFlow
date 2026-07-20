import { CaseAssignment } from '../models';

/**
 * 案件作業明細（アサイン契約）集約のデータアクセスおよび再構築を担うリポジトリの抽象契約。
 */
export interface CaseAssignmentRepository {
  /**
   * 指定した案件（複合キー）を参照するアサインレコードが存在するかどうかを検証する。
   */
  existsByCaseId(projectId: string, caseId: string): Promise<boolean>;

  /**
   * 登録されているすべての案件作業明細を取得する。
   */
  findAll(): Promise<readonly CaseAssignment[]>;

  /**
   * 指定されたプロジェクトIDに紐づくすべての明細を取得する。
   */
  findByProjectId(projectId: string): Promise<readonly CaseAssignment[]>;

  /**
   * 指定されたプロジェクトIDおよび案件IDに紐づくすべての明細を取得する。
   */
  findByCaseId(projectId: string, caseId: string): Promise<readonly CaseAssignment[]>;

  /**
   * 作業契約IDに一致する明細を取得する。
   */
  findById(id: string): Promise<CaseAssignment | null>;

  /**
   * 案件作業明細を保存する。
   */
  save(assignment: CaseAssignment): Promise<void>;

  /**
   * 指定された明細を作業契約IDで物理削除する。
   */
  delete(id: string): Promise<void>;

  /**
   * システム全体で次の作業契約IDを自動採番して生成する（WKnnn形式、欠番再利用なし）。
   */
  nextIdentity(): Promise<string>;
}

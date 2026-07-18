import { CaseAssignment } from '../../../src/domain/models';

/**
 * 案件作業明細新規登録の入力コマンド (DTO)
 */
export interface CreateCaseAssignmentCommand {
  readonly projectId: string;      // 親プロジェクトID
  readonly caseId: string;         // 対象案件ID
  readonly startDate: string;      // 開始日 (YYYY-MM-DD)
  readonly contractEffort: number; // 契約工数 (人月, > 0)
  readonly contractPrice: number;  // 契約単価 (円, >= 0)
}

/**
 * 案件作業明細情報更新の入力コマンド (DTO)
 */
export interface UpdateCaseAssignmentCommand {
  readonly projectId: string;      // 親プロジェクトID (変更不可)
  readonly id: string;             // 作業契約ID
  readonly startDate: string;      // 開始日 (YYYY-MM-DD)
  readonly contractEffort: number; // 契約工数 (人月, > 0)
  readonly contractPrice: number;  // 契約単価 (円, >= 0)
}

/**
 * 案件作業明細管理のユースケースを処理するアプリケーションサービスの抽象契約。
 */
export interface CaseAssignmentUseCase {
  /**
   * 登録されているすべての明細を取得する。
   * @returns プロジェクトID、作業契約ID順の明細一覧
   */
  getAssignments(): Promise<readonly CaseAssignment[]>;

  /**
   * 指定したプロジェクトIDおよび案件IDに紐づく明細の一覧を取得する。
   */
  getAssignmentsByCase(projectId: string, caseId: string): Promise<readonly CaseAssignment[]>;

  /**
   * 新しい作業明細を登録する。
   * @param command 新規登録パラメータ
   * @returns 登録されたCaseAssignmentインスタンス
   */
  createAssignment(command: CreateCaseAssignmentCommand): Promise<CaseAssignment>;

  /**
   * 既存の作業明細情報を更新する。
   * @param command 更新パラメータ
   */
  updateAssignment(command: UpdateCaseAssignmentCommand): Promise<void>;

  /**
   * 作業明細を物理削除する。
   * @param projectId プロジェクトID
   * @param id 作業契約ID
   */
  deleteAssignment(projectId: string, id: string): Promise<void>;
}

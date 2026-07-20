import { CaseAssignment } from '../../domain/models';

/**
 * 案件作業明細新規登録の入力コマンド (DTO)
 */
export interface CreateCaseAssignmentCommand {
  readonly projectId: string;
  readonly caseId: string;
  readonly startDate: string;
  readonly contractEffort: number;
  readonly contractPrice: number;
}

/**
 * 案件作業明細情報更新の入力コマンド (DTO)
 */
export interface UpdateCaseAssignmentCommand {
  readonly projectId: string;
  readonly id: string;
  readonly startDate: string;
  readonly contractEffort: number;
  readonly contractPrice: number;
}

/**
 * 案件作業明細管理のユースケースを処理するアプリケーションサービスの抽象契約。
 */
export interface CaseAssignmentUseCase {
  /**
   * 登録されているすべての明細を取得する。
   */
  getAssignments(): Promise<readonly CaseAssignment[]>;

  /**
   * 指定したプロジェクトIDおよび案件IDに紐づく明細の一覧を取得する。
   */
  getAssignmentsByCase(projectId: string, caseId: string): Promise<readonly CaseAssignment[]>;

  /**
   * 新しい作業明細を登録する。
   */
  createAssignment(command: CreateCaseAssignmentCommand): Promise<CaseAssignment>;

  /**
   * 既存の作業明細情報を更新する。
   */
  updateAssignment(command: UpdateCaseAssignmentCommand): Promise<void>;

  /**
   * 作業明細を物理削除する。
   */
  deleteAssignment(projectId: string, id: string): Promise<void>;
}

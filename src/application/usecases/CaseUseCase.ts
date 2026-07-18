import { Case } from '../../domain/models';

/**
 * 案件新規登録の入力パラメータ（Command/DTO）
 */
export interface CreateCaseCommand {
  readonly projectId: string;    // 親プロジェクトID
  readonly name: string;         // 案件名
  readonly startDate: string;    // 開始日 (YYYY-MM-DD)
  readonly endDate: string;      // 終了日 (YYYY-MM-DD)
}

/**
 * 案件情報更新の入力パラメータ（Command/DTO）
 */
export interface UpdateCaseCommand {
  readonly projectId: string;    // 親プロジェクトID (変更不可)
  readonly id: string;           // 案件ID
  readonly name: string;         // 案件名
  readonly startDate: string;    // 開始日 (YYYY-MM-DD)
  readonly endDate: string;      // 終了日 (YYYY-MM-DD)
}

/**
 * 案件管理のユースケース（書き込み/読み込み）抽象インターフェース。
 */
export interface CaseUseCase {
  /**
   * 案件の一覧を取得する。
   * @returns 案件ID昇順の案件一覧
   */
  getCases(): Promise<readonly Case[]>;

  /**
   * 指定したプロジェクトIDに紐づく案件の一覧を取得する。
   */
  getCasesByProject(projectId: string): Promise<readonly Case[]>;

  /**
   * 新しい案件を登録する。
   * @param command 新規登録パラメータ
   * @returns 登録されたCaseインスタンス
   */
  createCase(command: CreateCaseCommand): Promise<Case>;

  /**
   * 既存の案件情報を更新する。
   * @param command 更新パラメータ
   */
  updateCase(command: UpdateCaseCommand): Promise<void>;

  /**
   * 案件を物理削除する。
   * @param projectId プロジェクトID
   * @param id 案件ID
   */
  deleteCase(projectId: string, id: string): Promise<void>;
}

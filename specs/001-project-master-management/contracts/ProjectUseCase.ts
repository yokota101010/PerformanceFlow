import { Project } from '../data-model';

/**
 * プロジェクトの新規登録用入力パラメータ（Command/DTO）
 */
export interface CreateProjectCommand {
  readonly name: string; // 登録するプロジェクト名
}

/**
 * プロジェクトの編集用入力パラメータ（Command/DTO）
 */
export interface UpdateProjectCommand {
  readonly id: string;   // 対象のプロジェクトID
  readonly name: string; // 変更後のプロジェクト名
}

/**
 * プロジェクトマスタ管理のユースケース（書き込み/読み込み）抽象インターフェース。
 * UIコンポーネントがビジネスロジックを実行する際のエントリポイントとなる。
 */
export interface ProjectUseCase {
  /**
   * プロジェクトの一覧を取得する。
   * @returns プロジェクトID昇順のプロジェクト一覧
   */
  getProjects(): Promise<readonly Project[]>;

  /**
   * 新しいプロジェクトを登録する。
   * 入力値のトリミング、必須バリデーション、および名前の重複バリデーションを実行する。
   * @param command 新規登録パラメータ
   * @returns 登録されたProjectインスタンス（ID自動採番済み）
   * @throws DuplicateProjectNameError プロジェクト名が重複している場合
   * @throws ValidationError 入力値が不正（空欄、255文字超過など）の場合
   */
  createProject(command: CreateProjectCommand): Promise<Project>;

  /**
   * 既存のプロジェクト名を更新する。
   * 入力値のトリミング、必須バリデーション、および名前の重複バリデーションを実行する。
   * @param command 更新パラメータ
   * @throws DuplicateProjectNameError プロジェクト名が重複している場合
   * @throws ValidationError 入力値が不正の場合
   * @throws ProjectNotFoundError 対象のプロジェクトが存在しない場合
   */
  updateProject(command: UpdateProjectCommand): Promise<void>;

  /**
   * プロジェクトを削除する。
   * 該当プロジェクトが「案件」から参照されている場合は削除をブロックする。
   * @param id 削除対象のプロジェクトID
   * @throws DeleteRestrictionError 案件から参照されていて削除できない場合
   * @throws ProjectNotFoundError 対象のプロジェクトが存在しない場合
   */
  deleteProject(id: string): Promise<void>;
}

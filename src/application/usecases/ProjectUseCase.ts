import { Project } from '../../domain/models';

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
   * @param command 新規登録パラメータ
   * @returns 登録されたProjectインスタンス
   */
  createProject(command: CreateProjectCommand): Promise<Project>;

  /**
   * 既存のプロジェクト名を更新する。
   * @param command 更新パラメータ
   */
  updateProject(command: UpdateProjectCommand): Promise<void>;

  /**
   * プロジェクトを削除する。
   * @param id 削除対象のプロジェクトID
   */
  deleteProject(id: string): Promise<void>;
}

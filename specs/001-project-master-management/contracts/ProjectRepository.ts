import { Project } from '../data-model';

/**
 * プロジェクト集約の永続化・再構築を担うリポジトリインターフェース。
 * 憲法1.1条に基づき、技術的なデータアクセス（LocalStorage、インメモリなど）の具体的な実装から隔離されている。
 */
export interface ProjectRepository {
  /**
   * 登録されているすべてのプロジェクトを取得する。
   * プロジェクトIDの昇順でソートされたリストを返却する。
   */
  findAll(): Promise<readonly Project[]>;

  /**
   * 指定されたプロジェクトIDに一致するプロジェクトを取得する。
   * 存在しない場合は null を返却する。
   */
  findById(id: string): Promise<Project | null>;

  /**
   * 指定されたプロジェクト名に完全一致するプロジェクトを取得する。
   * 一意性制約の重複チェックに使用する。存在しない場合は null を返却する。
   */
  findByName(name: string): Promise<Project | null>;

  /**
   * プロジェクトを保存（新規登録または更新）する。
   */
  save(project: Project): Promise<void>;

  /**
   * 指定されたプロジェクトIDのデータを物理削除する。
   */
  delete(id: string): Promise<void>;
}

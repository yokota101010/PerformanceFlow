import { Project } from '../models';

/**
 * プロジェクト集約の永続化・再構築を担うリポジトリインターフェース。
 * データ永続化（LocalStorageやメモリ）の具体的な実装からドメイン層を隔離する。
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

  /**
   * 次のプロジェクトIDを自動採番して生成する（PJnnn形式、欠番再利用なし）。
   * 最大値が999に達した場合はエラーをスローする。
   */
  nextIdentity(): Promise<string>;
}

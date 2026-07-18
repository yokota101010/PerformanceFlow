import { ProjectRepository } from '../../domain/repositories';
import { LocalStorageProjectRepository } from './LocalStorageProjectRepository';

/**
 * リポジトリの具象インスタンスを一元管理するレジストリクラス。
 * 憲法に定める「直接の new 禁止」を強制し、シングルトンとしてインスタンスを提供する。
 */
export class RepositoryRegistry {
  private static projectRepository: ProjectRepository | null = null;

  private constructor() {
    // インスタンス化を禁止
  }

  /**
   * プロジェクトリポジトリを取得する。
   * デフォルトではブラウザ用の LocalStorageProjectRepository を返却する。
   * テスト時には明示的に registerProjectRepository() を用いて InMemoryProjectRepository 等を設定する。
   */
  static getProjectRepository(): ProjectRepository {
    if (!this.projectRepository) {
      this.projectRepository = new LocalStorageProjectRepository();
    }
    return this.projectRepository;
  }

  /**
   * テスト等で明示的にモックや他のリポジトリ実装を注入するヘルパー
   */
  static registerProjectRepository(repository: ProjectRepository): void {
    this.projectRepository = repository;
  }

  /**
   * レジストリの状態をクリアする（テスト用）
   */
  static clear(): void {
    this.projectRepository = null;
  }
}

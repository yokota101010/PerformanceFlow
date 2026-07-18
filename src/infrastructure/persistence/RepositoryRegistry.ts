import { ProjectRepository } from '../../domain/repositories';
import { InMemoryProjectRepository } from './InMemoryProjectRepository';
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
   * テスト環境 (Vitest) では InMemoryProjectRepository を、
   * ブラウザ本番環境では LocalStorageProjectRepository を動的に切り替えて返却する (T035)。
   */
  static getProjectRepository(): ProjectRepository {
    if (!this.projectRepository) {
      // Vitest 環境であるかを判定
      const isTestEnv = 
        typeof process !== 'undefined' && 
        (process.env.VITEST === 'true' || process.env.NODE_ENV === 'test');

      if (isTestEnv) {
        this.projectRepository = new InMemoryProjectRepository();
      } else {
        this.projectRepository = new LocalStorageProjectRepository();
      }
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

import { ProjectRepository, EmployeeRepository, EmployeeWorkTimeRepository } from '../../domain/repositories';
import { LocalStorageProjectRepository } from './LocalStorageProjectRepository';
import { LocalStorageEmployeeRepository } from './LocalStorageEmployeeRepository';
import { InMemoryEmployeeWorkTimeRepository } from './InMemoryEmployeeWorkTimeRepository';

/**
 * リポジトリの具象インスタンスを一元管理するレジストリクラス。
 * 憲法に定める「直接の new 禁止」を強制し、シングルトンとしてインスタンスを提供する。
 */
export class RepositoryRegistry {
  private static projectRepository: ProjectRepository | null = null;
  private static employeeRepository: EmployeeRepository | null = null;
  private static employeeWorkTimeRepository: EmployeeWorkTimeRepository | null = null;

  private constructor() {
    // インスタンス化を禁止
  }

  /**
   * プロジェクトリポジトリを取得する。
   */
  static getProjectRepository(): ProjectRepository {
    if (!this.projectRepository) {
      this.projectRepository = new LocalStorageProjectRepository();
    }
    return this.projectRepository;
  }

  /**
   * プロジェクトリポジトリを登録する（テスト用モック注入）。
   */
  static registerProjectRepository(repository: ProjectRepository): void {
    this.projectRepository = repository;
  }

  /**
   * 社員リポジトリを取得する。
   * デフォルトではブラウザ用の LocalStorageEmployeeRepository を返却する (T033)。
   */
  static getEmployeeRepository(): EmployeeRepository {
    if (!this.employeeRepository) {
      this.employeeRepository = new LocalStorageEmployeeRepository();
    }
    return this.employeeRepository;
  }

  /**
   * 社員リポジトリを登録する（テスト用モック注入）。
   */
  static registerEmployeeRepository(repository: EmployeeRepository): void {
    this.employeeRepository = repository;
  }

  /**
   * 社員工数リポジトリを取得する。
   * ※他集約（工数）の本番実装ができるまでは、インメモリのダミーを返却する (T028)。
   */
  static getEmployeeWorkTimeRepository(): EmployeeWorkTimeRepository {
    if (!this.employeeWorkTimeRepository) {
      this.employeeWorkTimeRepository = new InMemoryEmployeeWorkTimeRepository();
    }
    return this.employeeWorkTimeRepository;
  }

  /**
   * 社員工数リポジトリを登録する（テスト用モック注入）。
   */
  static registerEmployeeWorkTimeRepository(repository: EmployeeWorkTimeRepository): void {
    this.employeeWorkTimeRepository = repository;
  }

  /**
   * レジストリの状態をクリアする（テスト用）
   */
  static clear(): void {
    this.projectRepository = null;
    this.employeeRepository = null;
    this.employeeWorkTimeRepository = null;
  }
}
